export type VoiceModel = "HumanAI" | "Standard";

export function speak(
  text: string,
  opts: { volume?: number; lang?: string; voiceModel?: VoiceModel } = {},
): void {
  if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.volume = Math.max(0, Math.min(1, (opts.volume ?? 65) / 100));
  u.lang = opts.lang ?? "en-US";
  if (opts.voiceModel === "HumanAI") u.rate = 0.98;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
