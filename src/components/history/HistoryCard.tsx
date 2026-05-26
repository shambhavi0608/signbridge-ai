import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Copy, Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { TranslationRecord } from "@/lib/firestoreHelpers";

interface Props {
  record: TranslationRecord;
  onPlay: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function HistoryCard({ record, onPlay, onCopy, onDelete }: Props) {
  const date = new Date(record.createdAt);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card padding="md" className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs text-white/50 font-mono">
            {date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </div>
          {record.emotion && <Badge tone="accent">{record.emotion}</Badge>}
        </div>
        <p className="text-sm text-white leading-relaxed">{record.sentence}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" variant="secondary" disabled={!record.audioUrl} onClick={onPlay}>
            <Play className="h-3.5 w-3.5" /> Play Audio
          </Button>
          <Button size="sm" variant="ghost" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-400 hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
