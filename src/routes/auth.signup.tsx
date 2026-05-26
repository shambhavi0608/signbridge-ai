import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout, AuthInput, GoogleButton } from "@/components/auth/AuthLayout";
import { AppButton } from "@/components/ui/AppButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { AlertCircle } from "lucide-react";

export const Route = createFileRoute("/auth/signup")({ component: SignupPage });

function SignupPage() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!terms) { setError("Please accept the terms to continue"); return; }
    setLoading(true);
    try { await signUp(name, email, password); navigate({ to: "/dashboard" }); }
    catch (err) { setError((err as Error).message); }
    finally { setLoading(false); }
  };

  const google = async () => {
    setError(null); setGoogleLoading(true);
    try { await signInWithGoogle(); navigate({ to: "/dashboard" }); }
    catch (err) { setError((err as Error).message); }
    finally { setGoogleLoading(false); }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start translating sign language in real time">
      <form onSubmit={submit} className="space-y-4">
        <AuthInput label="Full name" value={name} onChange={setName} placeholder="Jane Doe" autoComplete="name" required />
        <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" required />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 characters" autoComplete="new-password" required />
        <AuthInput label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" autoComplete="new-password" required />

        <label className="flex items-start gap-2.5 text-xs text-white/70 cursor-pointer">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-[#F97316]" />
          <span>I agree to the Terms of Service and Privacy Policy.</span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
          </div>
        )}

        <AppButton type="submit" className="w-full" loading={loading}>Create account</AppButton>
      </form>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider"><span className="bg-[#15151c] px-2 text-white/40">or</span></div>
      </div>

      <GoogleButton onClick={google} loading={googleLoading} label="Sign up with Google" />

      <p className="text-center text-xs text-white/60 pt-2">
        Already have an account? <Link to="/auth/login" className="text-[#F97316] hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
