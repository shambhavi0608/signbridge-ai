import { useEffect, useRef, useState, type RefObject } from "react";

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandDetectionResult {
  hands: HandLandmark[][];
  handedness: string[];
  timestamp: number;
}

export interface UseHandDetectionOptions {
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef?: RefObject<HTMLCanvasElement | null>;
  maxNumHands?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  draw?: boolean;
  onResults?: (r: HandDetectionResult) => void;
}

const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/";

// Connection pairs for drawing the hand skeleton
const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

export function useHandDetection({
  enabled,
  videoRef,
  canvasRef,
  maxNumHands = 2,
  minDetectionConfidence = 0.6,
  minTrackingConfidence = 0.5,
  draw = true,
  onResults,
}: UseHandDetectionOptions) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HandDetectionResult>({
    hands: [],
    handedness: [],
    timestamp: 0,
  });

  const handsRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const onResultsRef = useRef(onResults);
  onResultsRef.current = onResults;

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const mod: any = await import("@mediapipe/hands");
        if (cancelled) return;
        const Hands = mod.Hands;
        const hands = new Hands({
          locateFile: (file: string) => `${CDN}${file}`,
        });
        hands.setOptions({
          maxNumHands,
          modelComplexity: 1,
          minDetectionConfidence,
          minTrackingConfidence,
        });
        hands.onResults((res: any) => {
          const landmarks: HandLandmark[][] = res.multiHandLandmarks ?? [];
          const handedness: string[] =
            (res.multiHandedness ?? []).map((h: any) => h.label) ?? [];
          const next: HandDetectionResult = {
            hands: landmarks,
            handedness,
            timestamp: performance.now(),
          };
          setResult(next);
          onResultsRef.current?.(next);

          if (draw && canvasRef?.current && videoRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const w = video.videoWidth || canvas.width;
            const h = video.videoHeight || canvas.height;
            if (canvas.width !== w) canvas.width = w;
            if (canvas.height !== h) canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const hand of landmarks) {
              ctx.strokeStyle = "#F97316";
              ctx.lineWidth = 2;
              for (const [a, b] of HAND_CONNECTIONS) {
                const pa = hand[a];
                const pb = hand[b];
                if (!pa || !pb) continue;
                ctx.beginPath();
                ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
                ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
                ctx.stroke();
              }
              ctx.fillStyle = "#ffffff";
              for (const p of hand) {
                ctx.beginPath();
                ctx.arc(p.x * canvas.width, p.y * canvas.height, 3, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        });
        handsRef.current = hands;
        setReady(true);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load hand model");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, maxNumHands, minDetectionConfidence, minTrackingConfidence, draw, canvasRef, videoRef]);

  // Inference loop
  useEffect(() => {
    if (!enabled || !ready) return;
    const video = videoRef.current;
    const hands = handsRef.current;
    if (!video || !hands) return;

    runningRef.current = true;
    const loop = async () => {
      if (!runningRef.current) return;
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        try {
          await hands.send({ image: video });
        } catch {
          // ignore frame errors
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enabled, ready, videoRef]);

  return { ready, error, result };
}
