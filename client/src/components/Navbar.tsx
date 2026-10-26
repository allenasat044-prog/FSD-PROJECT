import { NavLink, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const cls = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-full px-3 py-1.5 text-sm transition-colors", isActive ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/10 hover:text-white");

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toFeatures = () => {
    navigate("/");
    setTimeout(() => document.getElementById("features")?.scrollIntoView(), 60);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-[300] flex items-center justify-between border-b border-white/10 bg-black/55 px-5 py-3 backdrop-blur-md">
      <Link to="/" className="font-mono font-extrabold tracking-wide text-white">
        ░▒▓█ ASCII<span className="text-emerald-400">_CAM</span>
      </Link>
      <div className="flex items-center gap-1">
        <NavLink to="/" end className={cls}>Home</NavLink>
        <button onClick={toFeatures} className="hidden rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex">Features</button>
        <NavLink to="/explore" className={cls}>Explore</NavLink>
        <NavLink to="/gallery" className={cls}>Gallery</NavLink>
        <NavLink to="/faq" className={cls}>FAQ</NavLink>
        {user ? (
          <button onClick={() => { logout(); navigate("/"); }} title="Log out" className="ml-2 rounded-full border border-zinc-600 px-3 py-1.5 text-sm text-zinc-200 hover:border-zinc-400">
            {user.name.split(" ")[0]} · Log out
          </button>
        ) : (
          <>
            <Link to="/login" className="ml-2 rounded-full px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">Log in</Link>
            <Link to="/signup" className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black hover:bg-zinc-200">Sign up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
