import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { AppCard as Card } from "@/components/ui/AppCard";
import { AppButton as Button } from "@/components/ui/AppButton";
import { AppSlider as Slider } from "@/components/ui/AppSlider";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

type Tab = "global" | "security" | "accessibility";

function TabBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2.5 text-sm font-medium transition ${
        active ? "text-white" : "text-white/50 hover:text-white"
      }`}
    >
      {label}
      {active && <motion.span layoutId="settings-tab" className="absolute left-0 right-0 -bottom-px h-0.5 bg-[#F97316]" />}
    </button>
  );
}

function Toggle({ label, storageKey, defaultValue = false }: { label: string; storageKey: string; defaultValue?: boolean }) {
  const [on, setOn] = useState<boolean>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    return raw ? raw === "true" : defaultValue;
  });
  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem(storageKey, String(next));
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/80">{label}</span>
      <button
        onClick={toggle}
        className={`relative h-6 w-11 rounded-full transition ${on ? "bg-[#F97316]" : "bg-white/15"}`}
        aria-pressed={on}
      >
        <motion.span
          animate={{ x: on ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}

function Select({ label, storageKey, options, defaultValue }: { label: string; storageKey: string; options: string[]; defaultValue: string }) {
  const [v, setV] = useState<string>(defaultValue);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(storageKey);
    if (stored) setV(stored);
  }, [storageKey]);
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-white/80">{label}</span>
      <select
        value={v}
        onChange={(e) => { setV(e.target.value); localStorage.setItem(storageKey, e.target.value); }}
        className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white min-w-[140px] focus:outline-none focus:border-[#F97316]/50"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("global");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-white/60 mt-0.5">Tune detection, security, and accessibility preferences.</p>
      </motion.div>

      <div className="flex items-center gap-1 border-b border-white/8">
        <TabBtn active={tab === "global"} label="Global" onClick={() => setTab("global")} />
        <TabBtn active={tab === "security"} label="Security" onClick={() => setTab("security")} />
        <TabBtn active={tab === "accessibility"} label="Accessibility" onClick={() => setTab("accessibility")} />
      </div>

      {tab === "global" && <GlobalTab />}
      {tab === "security" && <SecurityTab />}
      {tab === "accessibility" && <AccessibilityTab />}
    </div>
  );
}

function GlobalTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="md" className="space-y-5">
        <h3 className="text-sm font-semibold text-white">Detection</h3>
        <Slider label="Detection Sensitivity" min={0.10} max={0.99} step={0.01} defaultValue={0.75} storageKey="signbridge:sensitivity" format={(v) => v.toFixed(2)} />
        <Select label="Facial Expression Tracking" storageKey="signbridge:facial" options={["Off", "Low", "High"]} defaultValue="Low" />
        <Toggle label="Adaptive Lighting" storageKey="signbridge:adaptiveLighting" defaultValue={true} />
      </Card>

      <Card padding="md" className="space-y-5">
        <h3 className="text-sm font-semibold text-white">Audio</h3>
        <Slider label="Audio Volume" min={0} max={100} defaultValue={65} storageKey="signbridge:volume" format={(v) => `${v}%`} />
        <Select label="Voice Model" storageKey="signbridge:voiceModel" options={["HumanAI", "Standard"]} defaultValue="HumanAI" />
        <Toggle label="Emotional Inflection" storageKey="signbridge:inflection" defaultValue={true} />
      </Card>

      <Card padding="md" className="space-y-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-white">Appearance</h3>
        <Select label="UI Theme" storageKey="signbridge:theme" options={["Dark", "Light"]} defaultValue="Dark" />
        <Slider label="Glassmorphism Intensity" min={0} max={100} defaultValue={70} storageKey="signbridge:glass" format={(v) => `${v}%`} />
      </Card>
    </div>
  );
}

function SecurityTab() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("Passwords don't match"); return; }
    if (next.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
    setCurrent(""); setNext(""); setConfirm("");
    toast.success("Password updated");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="md" className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Change Password</h3>
        <form onSubmit={submit} className="space-y-3">
          {[
            ["Current password", current, setCurrent],
            ["New password", next, setNext],
            ["Confirm new password", confirm, setConfirm],
          ].map(([label, val, setter]) => (
            <label key={label as string} className="block space-y-1">
              <span className="text-xs text-white/60">{label as string}</span>
              <input
                type="password" value={val as string}
                onChange={(e) => (setter as (s: string) => void)(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#F97316]/50"
              />
            </label>
          ))}
          <Button type="submit" loading={loading}>Update password</Button>
        </form>
      </Card>

      <Card padding="md" className="space-y-3">
        <h3 className="text-sm font-semibold text-white">Active Sessions</h3>
        <p className="text-xs text-white/50">No other active sessions.</p>
      </Card>
    </div>
  );
}

function AccessibilityTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card padding="md" className="space-y-5">
        <h3 className="text-sm font-semibold text-white">Vision</h3>
        <Slider label="Font size" min={12} max={22} defaultValue={14} storageKey="signbridge:fontSize" format={(v) => `${v}px`} />
        <Toggle label="High contrast" storageKey="signbridge:highContrast" />
      </Card>
      <Card padding="md" className="space-y-5">
        <h3 className="text-sm font-semibold text-white">Motion & Assist</h3>
        <Toggle label="Reduced motion" storageKey="signbridge:reducedMotion" />
        <Toggle label="Screen reader mode" storageKey="signbridge:screenReader" />
      </Card>
    </div>
  );
}
