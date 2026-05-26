import { useState } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, History, Settings as SettingsIcon, Cpu, ChevronLeft, ChevronRight,
  Play, LogOut, Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

const links = [
  { to: "/dashboard", label: "Live Translator", icon: Activity, exact: true },
  { to: "/dashboard/history", label: "Translation History", icon: History, exact: false },
  { to: "/dashboard/settings", label: "Emotion Settings", icon: SettingsIcon, exact: false },
  { to: "/dashboard/system-status", label: "System Status", icon: Cpu, exact: false },
] as const;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 280 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative h-screen shrink-0 border-r border-white/8 bg-black/30 backdrop-blur-xl flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#F97316] to-[#c2410c] grid place-items-center shadow-[0_8px_24px_-8px_rgba(249,115,22,0.7)]">
          <Hand className="h-5 w-5 text-black" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="min-w-0"
            >
              <div className="text-sm font-semibold text-white truncate">SignBridge AI</div>
              <div className="text-[11px] text-white/50 truncate">Premium Sign-to-Speech</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const active = isActive(l.to, l.exact);
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-white/8 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-[#F97316]"
                />
              )}
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-[#F97316]")} />
              {!collapsed && <span className="truncate">{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Start session */}
      <div className="px-3 pb-3">
        <Button
          variant="primary"
          className={cn("w-full", collapsed && "px-0")}
          onClick={() => navigate({ to: "/dashboard" })}
        >
          <Play className="h-4 w-4" />
          {!collapsed && <span>Start Session</span>}
        </Button>
      </div>

      {/* User */}
      <div className="border-t border-white/8 p-3 flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-white/20 to-white/5 grid place-items-center text-sm font-semibold">
          {(user?.name?.[0] ?? "U").toUpperCase()}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{user?.name ?? "Guest"}</div>
            <div className="text-[11px] text-white/50 truncate">Personal workspace</div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => signOut().then(() => navigate({ to: "/auth/login" }))}
            className="text-white/60 hover:text-white p-1.5 rounded-md hover:bg-white/8 transition"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-[#F97316] text-black grid place-items-center shadow-lg hover:scale-110 transition"
        aria-label="Toggle sidebar"
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>
    </motion.aside>
  );
}
