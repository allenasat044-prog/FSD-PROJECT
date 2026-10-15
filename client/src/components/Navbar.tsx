import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export type View = "home" | "explore" | "gallery" | "login";
export type Target = View | "features" | "faq";

export default function Navbar({ view, go }: { view: View; go: (t: Target) => void }) {
  const { user, logout } = useAuth();
  const link = (label: string, target: Target, active = false) => (
    <button onClick={() => go(target)} className={cn("rounded-full px-3 py-1.5 text-sm transition-colors", active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-white")}>
      {label}
    </button>
  );
  return (
    <nav className="fixed inset-x-0 top-0 z-[300] flex items-center justify-between border-b border-white/10 bg-black/55 px-5 py-3 backdrop-blur-md">
      <button onClick={() => go("home")} className="font-mono font-extrabold tracking-wide text-white">
        ░▒▓█ ASCII<span className="text-emerald-400">_CAM</span>
      </button>
      <div className="flex items-center gap-1">
        {link("Home", "home", view === "home")}
        <span className="hidden sm:inline-flex">{link("Features", "features")}</span>
        {link("Explore", "explore", view === "explore")}
        {link("Gallery", "gallery", view === "gallery")}
        <span className="hidden sm:inline-flex">{link("FAQ", "faq")}</span>
        {user ? (
          <button onClick={() => { logout(); go("home"); }} title="Log out" className="ml-2 rounded-full border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-400">
            {user.name.split(" ")[0]} · Log out
          </button>
        ) : (
          <button onClick={() => go("login")} className="ml-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-zinc-200">Log in</button>
        )}
      </div>
    </nav>
  );
}
