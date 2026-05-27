/**
 * Sign-language inference + translation API integration point.
 * Replace `INFERENCE_URL` and add your auth header to connect a real model.
 */
export const INFERENCE_URL = "http://localhost:8000"; // FastAPI backend

export interface InferenceResult {
  gesture: string;
  confidence: {
    spatial: number;     // 0..1
    temporal: number;
    contextual: number;
  };
  emotion: string | null;
}

export interface HealthResponse {
  status: string;
  model?: string;
  gestures?: number;
}

export async function pingBackend(): Promise<{
  ok: boolean;
  latencyMs: number | null;
  modelLoaded: boolean;
  health: HealthResponse | null;
}> {
  if (!INFERENCE_URL) return { ok: false, latencyMs: null };
  const t0 = performance.now();
  try {
    const res = await fetch(INFERENCE_URL + "/health", { method: "GET" });
    const latencyMs = Math.round(performance.now() - t0);
    if (!res.ok) return { ok: false, latencyMs, modelLoaded: false, health: null };
    const health = (await res.json()) as HealthResponse;
    return { ok: true, latencyMs, modelLoaded: health?.model === "loaded", health };
  } catch {
    return { ok: false, latencyMs: null, modelLoaded: false, health: null };
  }
}

export async function inferFrame(_frame: Blob): Promise<InferenceResult | null> {
  if (!INFERENCE_URL) return null;
  const form = new FormData();
  form.append("frame", _frame);
  const res = await fetch(INFERENCE_URL + "/infer", { method: "POST", body: form });
  if (!res.ok) return null;
  return (await res.json()) as InferenceResult;
}

export interface PredictResponse {
  gesture: string | null;
  confidence: number;
  error?: string;
}

export async function predictLandmarks(landmarks: number[][]): Promise<PredictResponse> {
  const res = await fetch(INFERENCE_URL + "/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks }),
  });
  if (!res.ok) {
    return { gesture: null, confidence: 0, error: `HTTP ${res.status}` };
  }
  return (await res.json()) as PredictResponse;
}

export async function translateSentence(
  text: string,
  targetLang: "en" | "hi" | "es",
): Promise<string> {
  if (!INFERENCE_URL || !text) return text;
  const res = await fetch(INFERENCE_URL + "/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  if (!res.ok) return text;
  const json = await res.json();
  return json.translated as string;
}
