import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppCard as Card } from "@/components/ui/AppCard";
import { StatusDot } from "@/components/ui/StatusDot";
import { useCamera } from "@/hooks/useCamera";
import { useSystemStatus } from "@/hooks/useSystemStatus";
import { useAuth } from "@/components/auth/AuthProvider";
import { Cpu, Camera, Cloud, Server, Mic, Waves } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/system-status")({
  component: SystemStatusPage,
});

function StatusCard({
  icon: Icon, title, ok, lines,
}: {
  icon: typeof Cpu; title: string; ok: boolean;
  lines: { label: string; value: string }[];
}) {
  return (
    <Card padding="md" className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#F97316]" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <StatusDot ok={ok} />
      </div>
      <div className="space-y-1 text-xs">
        {lines.map((l) => (
          <div key={l.label} className="flex justify-between">
            <span className="text-white/50">{l.label}</span>
            <span className="font-mono text-white/90 truncate ml-3">{l.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function EmotionBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/70">{label}</span>
        <span className="font-mono text-white/90">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          className="h-full bg-gradient-to-r from-[#F97316] to-[#fb923c]" />
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {Array.from({ length: 48 }).map((_, i) => {
        const h = active ? 20 + ((i * 13) % 70) : 8 + ((i * 7) % 14);
        return (
          <motion.div
            key={i}
            animate={active ? { height: [h, h * 0.4, h] } : { height: h }}
            transition={active ? { duration: 0.9 + (i % 5) * 0.1, repeat: Infinity, ease: "easeInOut" } : {}}
            className="w-1 rounded-full bg-gradient-to-t from-[#F97316]/70 to-[#fb923c]"
          />
        );
      })}
    </div>
  );
}

function SystemStatusPage() {
  const { state } = useCamera();
  const status = useSystemStatus(state.active);
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-semibold text-white">System Status</h1>
        <p className="text-sm text-white/60 mt-0.5">Live diagnostics across services.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusCard
          icon={Server} title="Backend API" ok={status.backend}
          lines={[
            { label: "URL", value: status.backendUrl },
            { label: "Ping", value: status.backendLatencyMs !== null ? `${status.backendLatencyMs} ms` : "—" },
          ]}
        />
        <StatusCard
          icon={Camera} title="Camera" ok={state.active}
          lines={[
            { label: "Resolution", value: state.resolution ?? "—" },
            { label: "FPS", value: state.active ? String(state.fps) : "—" },
            { label: "Permission", value: state.permission },
          ]}
        />
        <StatusCard
          icon={Cloud} title="Firebase" ok={status.firebase}
          lines={[
            { label: "Auth", value: user ? "Signed in" : "Signed out" },
            { label: "Firestore", value: status.firebase ? "Online" : "Offline" },
            { label: "Storage", value: status.firebase ? "Online" : "Offline" },
          ]}
        />
        <StatusCard
          icon={Cpu} title="AI Model" ok={status.model}
          lines={[
            { label: "Model", value: "signbridge-v1" },
            { label: "Last loaded", value: status.model ? "Just now" : "—" },
            { label: "Inference", value: status.model ? "—" : "—" },
          ]}
        />
      </div>

      <Card padding="md" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Emotion Analysis</h2>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Mic className="h-3.5 w-3.5" />
            <span className={state.active ? "text-emerald-300" : ""}>{state.active ? "Recording" : "Idle"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card padding="md" className="space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">Dominant Emotion</p>
            <p className="text-2xl font-semibold text-white">{state.active ? "—" : "Waiting…"}</p>
          </Card>
          <Card padding="md" className="space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">Audio Quality</p>
            <div className="flex justify-between text-sm"><span className="text-white/60">SNR Ratio</span><span className="font-mono">—</span></div>
            <div className="flex justify-between text-sm"><span className="text-white/60">Latency</span><span className="font-mono">—</span></div>
          </Card>
          <Card padding="md" className="space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5"><Waves className="h-3 w-3" /> Signal</p>
            <Waveform active={state.active} />
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
          <EmotionBar label="Happy" value={0} />
          <EmotionBar label="Calm" value={0} />
          <EmotionBar label="Sad" value={0} />
          <EmotionBar label="Angry" value={0} />
        </div>
      </Card>
    </div>
  );
}
