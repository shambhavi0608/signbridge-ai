import { cn } from "@/lib/utils";

interface Props {
  ok: boolean;
  label?: string;
  className?: string;
}

export function StatusDot({ ok, label, className }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs", className)}>
      <span className="relative flex h-2.5 w-2.5">
        {ok && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
        )}
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            ok ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
          )}
        />
      </span>
      {label && <span className="text-white/80">{label}</span>}
    </span>
  );
}
