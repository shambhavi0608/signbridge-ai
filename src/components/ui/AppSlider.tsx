import { useEffect, useState, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  storageKey?: string;
  format?: (v: number) => string;
  onChange?: (v: number) => void;
  className?: string;
}

export function AppSlider({
  label, min = 0, max = 100, step = 1, value, defaultValue = 50, storageKey,
  format, onChange, className,
}: Props) {
  const [internal, setInternal] = useState<number>(() => {
    if (typeof window !== "undefined" && storageKey) {
      const raw = window.localStorage.getItem(storageKey);
      if (raw !== null) return Number(raw);
    }
    return value ?? defaultValue;
  });

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setInternal(v);
    onChange?.(v);
    if (storageKey && typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, String(v));
    }
  };

  const pct = ((internal - min) / (max - min)) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/80">{label}</span>
          <span className="font-mono text-xs text-white/60">{format ? format(internal) : internal}</span>
        </div>
      )}
      <input
        type="range" min={min} max={max} step={step} value={internal} onChange={handle}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F97316]
                   [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(249,115,22,0.2)]
                   [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-[#F97316] [&::-moz-range-thumb]:border-0"
        style={{ background: `linear-gradient(to right, #F97316 0%, #F97316 ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)` }}
      />
    </div>
  );
}
