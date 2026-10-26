import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, errorText } from "@/lib/api";

const input = "w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400";
const social = "flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-2.5 text-sm font-medium hover:border-zinc-500";
const API = import.meta.env.VITE_API_URL || "/api";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-3l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

// One component for both /login and /signup.
export default function AuthPage({ mode }: { mode: "login" | "signup" }) {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [params] = useSearchParams();
  const from = (location.state as { from?: string } | null)?.from;
  const isLogin = mode === "login";

  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(params.get("error") ?? "");
  const [busy, setBusy] = useState(false);
  const [prov, setProv] = useState<{ google: boolean; github: boolean }>({ google: false, github: false });

  useEffect(() => { api.providers().then(setProv).catch(() => {}); }, []);
  useEffect(() => { setErr(params.get("error") ?? ""); }, [mode, params]);

  if (user) return <Navigate to={from && !from.startsWith("/login") && !from.startsWith("/signup") ? from : "/explore"} replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (isLogin) await login(f.email, f.password);
      else await register(f.name, f.email, f.password);
      // the <Navigate> above takes over as soon as `user` is set
    } catch (e2) { setErr(errorText(e2)); }
    finally { setBusy(false); }
  };

  const hasSocial = prov.google || prov.github;
  const other = isLogin ? "/signup" : "/login";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pt-20">
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <div>
          <h1 className="text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-zinc-400">{isLogin ? "Log in to save art to your gallery and keep presets." : "Free, and only takes a moment."}</p>
        </div>

        {hasSocial && (<>
          <div className="flex flex-col gap-2">
            {prov.google && <a href={`${API}/auth/google`} className={social}><GoogleIcon /> Continue with Google</a>}
            {prov.github && <a href={`${API}/auth/github`} className={social}><Github className="h-4 w-4" /> Continue with GitHub</a>}
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-500"><span className="h-px flex-1 bg-zinc-800" />or with email<span className="h-px flex-1 bg-zinc-800" /></div>
        </>)}

        <form onSubmit={submit} className="flex flex-col gap-3">
          {!isLogin && <input className={input} placeholder="Name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} maxLength={50} />}
          <input className={input} type="email" placeholder="Email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
          <div className="relative">
            <input className={`${input} pr-10`} type={show ? "text" : "password"} placeholder={isLogin ? "Password" : "Password (8+ characters)"} autoComplete={isLogin ? "current-password" : "new-password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={isLogin ? 1 : 8} maxLength={72} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-white">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {err && <p role="alert" className="text-sm text-amber-400">{err}</p>}
          <button disabled={busy} className="flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-400">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link to={other} state={location.state} replace className="font-medium text-white underline-offset-4 hover:underline">
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
