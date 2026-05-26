import { useEffect, useState } from "react";
import { pingBackend, INFERENCE_URL } from "@/lib/translationApi";
import { firebaseStatus, pingFirebase } from "@/lib/firebase";

export interface SystemStatus {
  camera: boolean;
  model: boolean;
  firebase: boolean;
  backend: boolean;
  backendLatencyMs: number | null;
  backendUrl: string;
}

export function useSystemStatus(cameraActive: boolean): SystemStatus {
  const [status, setStatus] = useState<SystemStatus>({
    camera: false, model: false, firebase: false, backend: false,
    backendLatencyMs: null, backendUrl: INFERENCE_URL || "Not configured",
  });

  useEffect(() => {
    let alive = true;
    const run = async () => {
      const [b, f] = await Promise.all([pingBackend(), pingFirebase()]);
      if (!alive) return;
      setStatus((s) => ({
        ...s,
        backend: b.ok,
        backendLatencyMs: b.latencyMs,
        model: b.ok, // model loads via backend
        firebase: f || firebaseStatus.connected,
      }));
    };
    run();
    const id = window.setInterval(run, 15000);
    return () => { alive = false; window.clearInterval(id); };
  }, []);

  useEffect(() => {
    setStatus((s) => ({ ...s, camera: cameraActive }));
  }, [cameraActive]);

  return status;
}
