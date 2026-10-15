import { useCallback, useEffect, useState } from "react";
import { Copy, Download, Eye, EyeOff, Globe, Lock, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, errorText, type Artwork } from "@/lib/api";
import { saveBlob } from "@/lib/ascii";
import { cn } from "@/lib/utils";

const btn = "flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:border-zinc-500";

export default function Gallery({ onNeedAuth }: { onNeedAuth: () => void }) {
  const { user } = useAuth();
  const [scope, setScope] = useState<"public" | "mine">("public");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<Artwork | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const r = await api.listArtworks({ scope, page, search: q || undefined });
      setItems(r.items); setPages(r.pages);
    } catch (e) { setErr(errorText(e)); }
    finally { setLoading(false); }
  }, [scope, page, q]);
  useEffect(() => { load(); }, [load]);

  const view = async (a: Artwork) => { try { setOpen(await api.getArtwork(a._id)); } catch (e) { setErr(errorText(e)); } };
  const rename = async (a: Artwork) => {
    const title = window.prompt("New title", a.title)?.trim();
    if (!title || title === a.title) return;
    try { await api.updateArtwork(a._id, { title }); load(); } catch (e) { setErr(errorText(e)); }
  };
  const toggle = async (a: Artwork) => { try { await api.updateArtwork(a._id, { isPublic: !a.isPublic }); load(); } catch (e) { setErr(errorText(e)); } };
  const remove = async (a: Artwork) => {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    try { await api.deleteArtwork(a._id); load(); } catch (e) { setErr(errorText(e)); }
  };
  const author = (a: Artwork) => (typeof a.user === "object" ? a.user.name : "you");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <h1 className="text-4xl font-bold tracking-tight">Gallery</h1>
      <p className="mt-2 text-zinc-400">ASCII art saved by the community, and your own creations.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(["public", "mine"] as const).map((s) => (
          <button key={s} onClick={() => { if (s === "mine" && !user) return onNeedAuth(); setScope(s); setPage(1); }}
            className={cn("rounded-full border px-4 py-1.5 text-sm", scope === s ? "border-zinc-500 bg-zinc-800 text-emerald-400" : "border-zinc-800 text-zinc-300")}>
            {s === "public" ? "Public" : "My creations"}
          </button>
        ))}
        <form className="ml-auto flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1); }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-emerald-400" />
          <button className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black">Search</button>
        </form>
      </div>

      {err && <p role="alert" className="mt-4 text-sm text-amber-400">{err}</p>}
      {loading ? <p className="mt-10 text-zinc-500">Loading…</p> : items.length === 0 ? (
        <p className="mt-10 text-zinc-500">{scope === "mine" ? "You haven't saved anything yet. Make some art in Explore and press Save." : "Nothing here yet."}</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <article key={a._id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
              <div className="flex aspect-video items-center justify-center bg-black">
                {a.thumbnail ? <img src={a.thumbnail} alt={a.title} className="max-h-full max-w-full object-contain" /> : <span className="font-mono text-zinc-600">░▒▓█</span>}
              </div>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="truncate font-semibold">{a.title}</h3>
                <p className="flex items-center gap-1 text-xs text-zinc-500">
                  {a.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />} {author(a)} · {a.cols}×{a.rowCount} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className={btn} onClick={() => view(a)}><Eye className="h-3 w-3" /> View</button>
                  {scope === "mine" && (<>
                    <button className={btn} onClick={() => rename(a)}><Pencil className="h-3 w-3" /> Rename</button>
                    <button className={btn} onClick={() => toggle(a)}>{a.isPublic ? <EyeOff className="h-3 w-3" /> : <Globe className="h-3 w-3" />} {a.isPublic ? "Make private" : "Make public"}</button>
                    <button className={cn(btn, "hover:border-red-500 hover:text-red-400")} onClick={() => remove(a)}><Trash2 className="h-3 w-3" /> Delete</button>
                  </>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={cn(btn, "disabled:opacity-40")}>Previous</button>
          <span className="text-zinc-400">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={cn(btn, "disabled:opacity-40")}>Next</button>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)}>
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col gap-3 rounded-2xl border border-zinc-700 bg-zinc-950 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="truncate text-lg font-semibold">{open.title}</h2>
              <div className="flex gap-2">
                <button className={btn} onClick={() => navigator.clipboard.writeText(open.text ?? "")}><Copy className="h-3 w-3" /> Copy</button>
                <button className={btn} onClick={() => saveBlob(`${open.title}.txt`, new Blob([open.text ?? ""], { type: "text/plain" }))}><Download className="h-3 w-3" /> TXT</button>
                <button className={btn} onClick={() => setOpen(null)} aria-label="Close"><X className="h-3 w-3" /></button>
              </div>
            </div>
            <pre className={cn("overflow-auto rounded-lg bg-black p-3 font-mono text-[6px] leading-[7px]", open.settings.mode === "amber" ? "text-amber-400" : "text-emerald-400")}>{open.text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
