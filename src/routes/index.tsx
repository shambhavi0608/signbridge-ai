import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/components/auth/AuthProvider";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0A0A0F]" />;
  return <Navigate to={user ? "/dashboard" : "/auth/login"} />;
}
