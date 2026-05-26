import { AppCard as Card } from "@/components/ui/AppCard";
import { AppButton as Button } from "@/components/ui/AppButton";
import { Volume2, X, MessageSquare } from "lucide-react";

interface Props {
  sentence: string;
  onSpeak: () => void;
  onClear: () => void;
  speaking?: boolean;
}

export function SentencePanel({ sentence, onSpeak, onClear, speaking }: Props) {
  const empty = !sentence.trim();
  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-[#F97316]" />
        <h3 className="text-sm font-semibold text-white">Translated Sentence</h3>
      </div>
      <div
        className={`min-h-[88px] rounded-xl border border-white/8 bg-black/30 px-4 py-3 text-sm leading-relaxed ${
          empty ? "text-white/30 italic" : "text-white"
        }`}
      >
        {empty ? "Detected signs will appear here" : sentence}
      </div>
      <div className="flex gap-2">
        <Button variant="primary" disabled={empty} loading={speaking} onClick={onSpeak}>
          <Volume2 className="h-4 w-4" /> Speak
        </Button>
        <Button variant="secondary" disabled={empty} onClick={onClear}>
          <X className="h-4 w-4" /> Clear
        </Button>
      </div>
    </Card>
  );
}
