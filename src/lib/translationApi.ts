/**
 * Sign-language inference + translation API integration point.
 * Replace `INFERENCE_URL` and add your auth header to connect a real model.
 */
export const INFERENCE_URL = ""; // e.g. "https://your-backend/api/inference"

export interface InferenceResult {
  gesture: string;
  confidence: {
    spatial: number;     // 0..1
    temporal: number;
    contextual: number;
  };
  emotion: string | null;
}

export async function pingBackend(): Promise<{ ok: boolean; latencyMs: number | null }> {
  if (!INFERENCE_URL) return { ok: false, latencyMs: null };
  const t0 = performance.now();
  try {
    const res = await fetch(INFERENCE_URL + "/health", { method: "GET" });
    return { ok: res.ok, latencyMs: Math.round(performance.now() - t0) };
  } catch {
    return { ok: false, latencyMs: null };
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
