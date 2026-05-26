import { Card } from "@/components/ui/Card";
import { Hand } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  gesture: string | null;
}

export function GestureCard({ gesture }: Props) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 mb-3">
        <Hand className="h-4 w-4 text-[#F97316]" />
        <h3 className="text-sm font-semibold text-white">Detected Gesture</h3>
      </div>
      <motion.div
        key={gesture ?? "none"}
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-black/30 border border-white/8 px-4 py-6 text-center"
      >
        {gesture ? (
          <div className="text-2xl font-semibold text-white">{gesture}</div>
        ) : (
          <div className="text-sm text-white/40">No gesture detected</div>
        )}
      </motion.div>
    </Card>
  );
}
