import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { errorText } from "@/lib/api";

const input = "w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400";

export default function AuthPage({ onDone }: { onDone: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      if (mode === "login") await login(f.email, f.password);
      else await register(f.name, f.email, f.password);
      onDone();
    } catch (e2) { setErr(errorText(e2)); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pt-20">
      <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Log in" : "Create your account"}</h1>
        <p className="text-sm text-zinc-400">{mode === "login" ? "Log in to save art to your gallery and keep presets." : "Free, and only takes a moment."}</p>
        {mode === "register" && <input className={input} placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} />}
        <input className={input} type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input className={input} type="password" placeholder="Password (8+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required minLength={mode === "register" ? 8 : 1} />
        {err && <p role="alert" className="text-sm text-amber-400">{err}</p>}
        <button disabled={busy} className="rounded-lg bg-white py-2.5 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60">
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }} className="text-sm text-zinc-400 hover:text-white">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
