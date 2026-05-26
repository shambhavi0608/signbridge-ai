import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar/Sidebar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#0A0A0F] text-white">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="mx-auto max-w-[1600px] p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
