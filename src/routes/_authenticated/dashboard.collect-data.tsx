import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Database, Download, Play, Trash2, Hand } from "lucide-react";
import { toast } from "sonner";
import { WebcamFeed } from "@/components/camera/WebcamFeed";
import { AppCard as Card } from "@/components/ui/AppCard";
import { AppButton as Button } from "@/components/ui/AppButton";
import { AppBadge as Badge } from "@/components/ui/AppBadge";
import { useCamera } from "@/hooks/useCamera";
import { useHandDetection, type HandLandmark } from "@/hooks/useHandDetection";

export const Route = createFileRoute("/_authenticated/dashboard/collect-data")({
  ssr: false,
  component: CollectDataPage,
});

const FRAMES_PER_SAMPLE = 30;
const TARGET_PER_GESTURE = 50;
const STORAGE_KEY = "signbridge:dataset";

// One sample = 30 frames × 21 landmarks × {x,y,z}
type Sample = {
  id: string;
  gesture: string;
  createdAt: number;
  landmarks: number[][][];
};

function loadSamples(): Sample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Sample[]) : [];
  } catch {
    return [];
  }
}

function saveSamples(samples: Sample[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch (e) {
    console.error("Failed to persist dataset", e);
  }
}

function padOrTrimHand(hand: HandLandmark[] | undefined): number[][] {
  // Always return 21 points × 3 coords
  const out: number[][] = [];
  for (let i = 0; i < 21; i++) {
    const p = hand?.[i];
    out.push([p?.x ?? 0, p?.y ?? 0, p?.z ?? 0]);
  }
  return out;
}

function CollectDataPage() {
  const { videoRef, state, start, stop } = useCamera();
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const hands = useHandDetection({
    enabled: state.active,
    videoRef,
    canvasRef: overlayRef,
    maxNumHands: 2,
  });

  const [gesture, setGesture] = useState("");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [recording, setRecording] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  // Buffer kept in a ref so the detection callback can push without re-renders
  const bufferRef = useRef<number[][][]>([]);
  const recordingRef = useRef(false);

  useEffect(() => { setSamples(loadSamples()); }, []);
  useEffect(() => { saveSamples(samples); }, [samples]);

  // Push a frame each time MediaPipe returns results while recording
  useEffect(() => {
    if (!recordingRef.current) return;
    if (!hands.result.hands.length) return;
    const frame = padOrTrimHand(hands.result.hands[0]);
    bufferRef.current.push(frame);
    setFrameCount(bufferRef.current.length);

    if (bufferRef.current.length >= FRAMES_PER_SAMPLE) {
      const sample: Sample = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        gesture: gesture.trim().toUpperCase(),
        createdAt: Date.now(),
        landmarks: bufferRef.current.slice(0, FRAMES_PER_SAMPLE),
      };
      setSamples((prev) => [sample, ...prev]);
      bufferRef.current = [];
      recordingRef.current = false;
      setRecording(false);
      setFrameCount(0);
      toast.success(`Sample saved for "${sample.gesture}"`);
    }
  }, [hands.result.timestamp, gesture]);

  const currentGestureCount = useMemo(
    () => samples.filter((s) => s.gesture === gesture.trim().toUpperCase()).length,
    [samples, gesture],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of samples) map.set(s.gesture, (map.get(s.gesture) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [samples]);

  const onRecord = () => {
    const name = gesture.trim().toUpperCase();
    if (!name) return toast.error("Type a gesture name first");
    if (!state.active) return toast.error("Start the camera first");
    if (!hands.ready) return toast.error("Hand model still loading…");
    bufferRef.current = [];
    setFrameCount(0);
    recordingRef.current = true;
    setRecording(true);
    toast.message(`Recording 30 frames for "${name}"…`);
  };

  const onDelete = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
  };

  const onClearGesture = (name: string) => {
    if (!confirm(`Delete all samples for "${name}"?`)) return;
    setSamples((prev) => prev.filter((s) => s.gesture !== name));
  };

  const onExport = () => {
    if (!samples.length) return toast.error("No samples to export");
    const payload = samples.map((s) => ({ gesture: s.gesture, landmarks: s.landmarks }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `signbridge-dataset-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${samples.length} samples`);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Collect Training Data</h1>
          <p className="text-sm text-white/60 mt-0.5">Record 30-frame landmark sequences for each gesture.</p>
        </div>
        <Badge tone="accent"><Database className="h-3 w-3" /> {samples.length} samples total</Badge>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: webcam */}
        <div className="xl:col-span-5 space-y-6">
          <WebcamFeed
            videoRef={videoRef} overlayRef={overlayRef} active={state.active} fps={state.fps}
            error={state.error} onStart={start} onStop={stop}
            handsDetected={hands.result.hands.length}
          />
        </div>

        {/* Middle: recording controls */}
        <div className="xl:col-span-4 space-y-6">
          <Card padding="md" className="space-y-4">
            <div className="flex items-center gap-2">
              <Hand className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-semibold text-white">Record Sample</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50">Gesture Name</label>
              <input
                value={gesture}
                onChange={(e) => setGesture(e.target.value)}
                placeholder="e.g. HELLO"
                disabled={recording}
                className="w-full h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/50 uppercase tracking-wider"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={onRecord}
              disabled={recording || !gesture.trim() || !state.active}
            >
              <Play className="h-4 w-4" />
              {recording ? `Recording… ${frameCount}/${FRAMES_PER_SAMPLE}` : "Record (30 frames)"}
            </Button>

            {recording && (
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#F97316] transition-all"
                  style={{ width: `${(frameCount / FRAMES_PER_SAMPLE) * 100}%` }}
                />
              </div>
            )}

            <div className="rounded-xl bg-black/30 border border-white/8 px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Samples for this gesture</span>
                <span className="font-mono text-white">
                  {currentGestureCount}/{TARGET_PER_GESTURE}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[#F97316] transition-all"
                  style={{ width: `${Math.min(100, (currentGestureCount / TARGET_PER_GESTURE) * 100)}%` }}
                />
              </div>
            </div>
          </Card>

          <Card padding="md" className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Export</h3>
            <p className="text-xs text-white/50">Download all samples as JSON for model training.</p>
            <Button variant="secondary" className="w-full" onClick={onExport} disabled={!samples.length}>
              <Download className="h-4 w-4" /> Export Dataset ({samples.length})
            </Button>
          </Card>
        </div>

        {/* Right: by-gesture counts */}
        <div className="xl:col-span-3 space-y-6">
          <Card padding="md" className="space-y-3">
            <h3 className="text-sm font-semibold text-white">By Gesture</h3>
            {grouped.length === 0 ? (
              <p className="text-xs text-white/40 italic">No samples yet.</p>
            ) : (
              <ul className="space-y-1.5 max-h-80 overflow-auto pr-1">
                {grouped.map(([name, count]) => (
                  <li key={name} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-white/80">{name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/60">{count}/{TARGET_PER_GESTURE}</span>
                      <button
                        onClick={() => onClearGesture(name)}
                        className="text-white/30 hover:text-red-400 transition"
                        aria-label={`Delete all ${name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* All samples list */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Collected Samples</h3>
          <span className="text-xs text-white/40">{samples.length} total</span>
        </div>
        {samples.length === 0 ? (
          <p className="text-xs text-white/40 italic py-6 text-center">
            No samples recorded yet. Start the camera, type a gesture name, and click Record.
          </p>
        ) : (
          <div className="max-h-96 overflow-auto rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-white/50 text-xs uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Gesture</th>
                  <th className="text-left px-4 py-2 font-medium">Frames</th>
                  <th className="text-left px-4 py-2 font-medium">Recorded</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {samples.map((s) => (
                  <tr key={s.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="px-4 py-2 font-mono text-white">{s.gesture}</td>
                    <td className="px-4 py-2 font-mono text-white/60">{s.landmarks.length}</td>
                    <td className="px-4 py-2 text-white/50 text-xs">
                      {new Date(s.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => onDelete(s.id)}
                        className="text-white/30 hover:text-red-400 transition"
                        aria-label="Delete sample"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
