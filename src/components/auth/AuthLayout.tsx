import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Hand } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0A0F] flex items-center justify-center p-6">
      {/* Backdrop glows */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-[#F97316]/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-fuchsia-500/10 blur-[140px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md glass-strong rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#F97316] to-[#c2410c] grid place-items-center">
            <Hand className="h-5 w-5 text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">SignBridge AI</div>
            <div className="text-[11px] text-white/50">Premium Sign-to-Speech</div>
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-white/60">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
      </motion.div>
    </div>
  );
}

export function AuthInput({
  label, type = "text", value, onChange, placeholder, autoComplete, required,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  autoComplete?: string; required?: boolean;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-white/70">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} required={required}
        className="w-full h-11 px-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white
                   placeholder:text-white/30 focus:outline-none focus:border-[#F97316]/60
                   focus:ring-2 focus:ring-[#F97316]/20 transition"
      />
    </label>
  );
}

export function GoogleButton({ onClick, loading, label }: { onClick: () => void; loading?: boolean; label: string }) {
  return (
    <button
      type="button" onClick={onClick} disabled={loading}
      className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-xl
                 bg-white/8 border border-white/10 text-sm font-medium text-white
                 hover:bg-white/12 transition disabled:opacity-50"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
      {label}
    </button>
  );
}
