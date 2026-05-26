import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Tone = "default" | "success" | "danger" | "warning" | "accent" | "muted";
interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  default: "bg-white/10 text-white border-white/15",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  danger: "bg-red-500/15 text-red-300 border-red-400/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-400/30",
  accent: "bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30",
  muted: "bg-white/5 text-white/60 border-white/10",
};

export function AppBadge({ className, tone = "default", ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone], className,
      )}
      {...rest}
    />
  );
}
