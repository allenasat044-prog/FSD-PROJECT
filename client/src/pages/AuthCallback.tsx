import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Google/GitHub send the browser back here as  /auth/callback#token=...
export default function AuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const ran = useRef(false); // React StrictMode runs effects twice in dev

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    window.history.replaceState(null, "", window.location.pathname); // keep the token out of the address bar/history
    if (!token) { setErr("No sign-in token received."); return; }
    loginWithToken(token).then(() => navigate("/explore", { replace: true })).catch(() => setErr("Sign-in failed. Please try again."));
  }, [loginWithToken, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      {err ? (<><p role="alert" className="text-amber-400">{err}</p><Link to="/login" className="text-sm underline">Back to log in</Link></>) : <p className="text-zinc-400">Signing you in…</p>}
    </div>
  );
}
