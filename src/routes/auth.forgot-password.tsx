import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout, AuthInput } from "@/components/auth/AuthLayout";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/auth/forgot-password")({ component: ForgotPasswordPage });

function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try { await resetPassword(email); setSent(true); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a link to reset it">
      {sent ? (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Check your email</div>
            <div className="text-xs text-emerald-200/80 mt-0.5">We've sent a password reset link to <span className="font-mono">{email}</span>.</div>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" required />
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
            </div>
          )}
          <AppButton type="submit" className="w-full" loading={loading}>Send reset link</AppButton>
        </form>
      )}
      <p className="text-center text-xs text-white/60 pt-2">
        <Link to="/auth/login" className="text-[#F97316] hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
