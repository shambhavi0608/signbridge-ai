import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search translations…" }: Props) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 pl-10 pr-4 rounded-xl glass text-sm text-white placeholder:text-white/40
                   focus:outline-none focus:border-[#F97316]/50 focus:ring-2 focus:ring-[#F97316]/20 transition"
      />
    </div>
  );
}
