import { motion } from "framer-motion";

interface MeterProps {
  label: string;
  value: number; // 0..1
}

function Meter({ label, value }: MeterProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/90">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-[#fb923c]"
        />
      </div>
    </div>
  );
}

interface Props {
  spatial: number;
  temporal: number;
  contextual: number;
}

export function ConfidenceMeter({ spatial, temporal, contextual }: Props) {
  return (
    <div className="space-y-3">
      <Meter label="Spatial Accuracy" value={spatial} />
      <Meter label="Temporal Fluidity" value={temporal} />
      <Meter label="Contextual Match" value={contextual} />
    </div>
  );
}
