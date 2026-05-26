import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WebcamFeed } from "@/components/camera/WebcamFeed";
import { GestureCard } from "@/components/detection/GestureCard";
import { ConfidenceMeter } from "@/components/detection/ConfidenceMeter";
import { SentencePanel } from "@/components/detection/SentencePanel";
import { AppCard as Card } from "@/components/ui/AppCard";
import { AppBadge as Badge } from "@/components/ui/AppBadge";
import { StatusDot } from "@/components/ui/StatusDot";
import { useCamera } from "@/hooks/useCamera";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useFirestoreHistory } from "@/hooks/useFirestoreHistory";
import { speak } from "@/lib/speechSynthesis";
import { Smile, Languages, Activity } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: LiveTranslator,
});

type Lang = "en" | "hi" | "es";

function LiveTranslator() {
  const { videoRef, state, start, stop } = useCamera();
  const status = useSystemStatus(state.active);
  const { add } = useFirestoreHistory();

  const [sentence, setSentence] = useState("");
  const [gesture, setGesture] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("signbridge:lang") as Lang | null;
    if (stored) setLang(stored);
  }, []);
  const [speaking, setSpeaking] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [gestureCount, setGestureCount] = useState(0);

  // Track session time
  useEffect(() => {
    if (!state.active) return;
    if (!sessionStart) setSessionStart(Date.now());
    const id = window.setInterval(() => {
      if (sessionStart) setElapsed(Math.floor((Date.now() - sessionStart) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.active, sessionStart]);

  useEffect(() => {
    if (!state.active) { setSessionStart(null); setElapsed(0); }
  }, [state.active]);

  useEffect(() => { if (typeof window !== "undefined") window.localStorage.setItem("signbridge:lang", lang); }, [lang]);

  const onSpeak = async () => {
    if (!sentence) return;
    setSpeaking(true);
    const volume = Number(localStorage.getItem("signbridge:volume") ?? 65);
    const langTag = { en: "en-US", hi: "hi-IN", es: "es-ES" }[lang];
    speak(sentence, { volume, lang: langTag });
    add({ sentence, emotion, audioUrl: null });
    toast.success("Saved to history");
    setTimeout(() => setSpeaking(false), 600);
  };

  const onClear = () => {
    setSentence(""); setGesture(null); setEmotion(null);
  };

  const time = useMemo(() => {
    const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [elapsed]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Live Translator</h1>
          <p className="text-sm text-white/60 mt-0.5">Real-time sign language to speech translation.</p>
        </div>
        <Badge tone={state.active ? "success" : "muted"}>
          <Activity className="h-3 w-3" /> {state.active ? "Session active" : "Idle"}
        </Badge>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left */}
        <div className="xl:col-span-4 space-y-6">
          <WebcamFeed
            videoRef={videoRef} active={state.active} fps={state.fps}
            error={state.error} onStart={start} onStop={stop}
          />
        </div>

        {/* Center */}
        <div className="xl:col-span-5 space-y-6">
          <GestureCard gesture={gesture} />
          <Card padding="md" className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Confidence Signals</h3>
            <ConfidenceMeter spatial={0} temporal={0} contextual={0} />
          </Card>
          <SentencePanel sentence={sentence} speaking={speaking} onSpeak={onSpeak} onClear={onClear} />
        </div>

        {/* Right */}
        <div className="xl:col-span-3 space-y-6">
          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-semibold text-white">Emotion</h3>
            </div>
            {emotion ? (
              <Badge tone="accent">{emotion}</Badge>
            ) : (
              <p className="text-xs text-white/40 italic">No emotion detected</p>
            )}
          </Card>

          <Card padding="md" className="space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-[#F97316]" />
              <h3 className="text-sm font-semibold text-white">Language</h3>
            </div>
            <select
              value={lang} onChange={(e) => setLang(e.target.value as Lang)}
              className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F97316]/50"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
            </select>
          </Card>

          <Card padding="md" className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Session Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/60">Gestures detected</span><span className="font-mono">{gestureCount}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Session time</span><span className="font-mono">{time}</span></div>
              <div className="flex justify-between"><span className="text-white/60">Accuracy</span><span className="font-mono">{state.active ? "0%" : "--%"}</span></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom status pills */}
      <Card padding="sm" className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <StatusDot ok={status.camera} label="Camera" />
        <StatusDot ok={status.model} label="Model" />
        <StatusDot ok={status.firebase} label="Firebase" />
        <StatusDot ok={status.backend} label="Backend" />
        <span className="ml-auto text-[11px] text-white/40 font-mono">
          {status.backendUrl}
        </span>
      </Card>

      {/* Hidden — silences unused setter warnings; these wire to real inference */}
      <span className="hidden">{setGesture.length}{setEmotion.length}{setGestureCount.length}{setSentence.length}</span>
    </div>
  );
}
