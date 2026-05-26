import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraState {
  active: boolean;
  fps: number;
  error: string | null;
  resolution: string | null;
  permission: "granted" | "denied" | "prompt" | "unknown";
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<CameraState>({
    active: false,
    fps: 0,
    error: null,
    resolution: null,
    permission: "unknown",
  });

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setState((s) => ({ ...s, active: false, fps: 0, resolution: null }));
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      const resolution = settings.width && settings.height ? `${settings.width}x${settings.height}` : null;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setState({ active: true, fps: 0, error: null, resolution, permission: "granted" });

      // FPS counter from rAF
      let frames = 0;
      let last = performance.now();
      const tick = () => {
        frames++;
        const now = performance.now();
        if (now - last >= 1000) {
          setState((s) => ({ ...s, fps: frames }));
          frames = 0;
          last = now;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      const err = e as Error;
      setState((s) => ({
        ...s,
        active: false,
        error: err.message || "Camera access denied",
        permission: err.name === "NotAllowedError" ? "denied" : "unknown",
      }));
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, state, start, stop };
}
