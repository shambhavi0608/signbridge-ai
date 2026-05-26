import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/history/SearchBar";
import { HistoryCard } from "@/components/history/HistoryCard";
import { AppCard as Card } from "@/components/ui/AppCard";
import { useFirestoreHistory } from "@/hooks/useFirestoreHistory";
import { speak } from "@/lib/speechSynthesis";
import { toast } from "sonner";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { items, remove } = useFirestoreHistory();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((r) => r.sentence.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white">Translation History</h1>
        <p className="text-sm text-white/60 mt-0.5">Your saved translations, newest first.</p>
      </motion.div>

      <SearchBar value={query} onChange={setQuery} />

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center py-16">
          <Inbox className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/50">
            {items.length === 0 ? "No translation history yet" : "No results match your search"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((r) => (
              <HistoryCard
                key={r.id}
                record={r}
                onPlay={() => speak(r.sentence)}
                onCopy={() => {
                  navigator.clipboard.writeText(r.sentence);
                  toast.success("Copied to clipboard");
                }}
                onDelete={() => { remove(r.id); toast.success("Deleted"); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
