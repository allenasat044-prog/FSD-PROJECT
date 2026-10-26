import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <pre className="font-mono text-6xl font-extrabold text-emerald-400">4░4</pre>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-zinc-400">That page does not exist (or the art was removed).</p>
      <Link to="/" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200">Back home</Link>
    </div>
  );
}
