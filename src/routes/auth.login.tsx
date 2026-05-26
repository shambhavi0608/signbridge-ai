import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/auth/AuthLayout";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth/login")({ component: LoginPage });

function LoginPage() {
  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await signIn(email, password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  const google = async () => {
    setError(null); setGoogleLoading(true);
    try { await signInWithGoogle(); navigate({ to: "/dashboard" }); }
    catch (err) { setError((err as Error).message); }
    finally { setGoogleLoading(false); }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your SignBridge AI workspace">
      <form onSubmit={submit} className="space-y-4">
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" required />

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <AppButton type="submit" className="w-full" loading={loading}>Sign in</AppButton>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider"><span className="bg-[#15151c] px-2 text-white/40">or</span></div>
      </div>

      <GoogleButton onClick={google} loading={googleLoading} label="Continue with Google" />

      <div className="flex items-center justify-between text-xs pt-2">
        <Link to="/auth/forgot-password" className="text-white/60 hover:text-[#F97316] transition">Forgot password?</Link>
        <Link to="/auth/signup" className="text-white/60 hover:text-[#F97316] transition">Create account</Link>
      </div>
    </AuthLayout>
  );
}
