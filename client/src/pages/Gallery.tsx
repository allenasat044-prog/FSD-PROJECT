import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Globe, Lock, Pencil, Search, Trash2, X } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { useAuth } from "@/context/AuthContext";
import { api, errorText, type Artwork, type ArtworkQuery } from "@/lib/api";
import { cn } from "@/lib/utils";

const btn = "flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 hover:border-zinc-500";
const chip = (on: boolean) => cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", on ? "border-zinc-500 bg-zinc-800 text-emerald-400" : "border-zinc-800 text-zinc-300 hover:border-zinc-600");

type Scope = ArtworkQuery["scope"];
const SCOPES: { id: Scope; label: string; needsLogin: boolean }[] = [
  { id: "public", label: "Public", needsLogin: false },
  { id: "mine", label: "My creations", needsLogin: true },
  { id: "liked", label: "Liked", needsLogin: true },
];
const SOURCES: { id: Artwork["sourceType"] | ""; label: string }[] = [
  { id: "", label: "All sources" }, { id: "camera", label: "Camera" }, { id: "video", label: "Video" }, { id: "image", label: "Image" },
];

export default function Gallery({ onNeedAuth }: { onNeedAuth: () => void }) {
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>("public");
  const [sort, setSort] = useState<"new" | "top">("new");
  const [source, setSource] = useState<Artwork["sourceType"] | "">("");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const r = await api.listArtworks({ scope, page, sort, search: q || undefined, source: source || undefined, tag: tag || undefined });
      setItems(r.items); setPages(r.pages); setTotal(r.total);
    } catch (e) { setErr(errorText(e)); }
    finally { setLoading(false); }
  }, [scope, page, sort, q, source, tag]);
  useEffect(() => { load(); }, [load]);

  // If the user logs out while on a private tab, fall back to Public.
  useEffect(() => { if (!user && scope !== "public") { setScope("public"); setPage(1); } }, [user, scope]);

  const reset = () => setPage(1);
  const patch = (id: string, p: Partial<Artwork>) => setItems((list) => list.map((a) => (a._id === id ? { ...a, ...p } : a)));

  const rename = async (a: Artwork) => {
    const title = window.prompt("New title", a.title)?.trim();
    if (!title || title === a.title) return;
    try { await api.updateArtwork(a._id, { title }); patch(a._id, { title }); } catch (e) { setErr(errorText(e)); }
  };
  const toggle = async (a: Artwork) => {
    try { await api.updateArtwork(a._id, { isPublic: !a.isPublic }); patch(a._id, { isPublic: !a.isPublic }); } catch (e) { setErr(errorText(e)); }
  };
  const remove = async (a: Artwork) => {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    try { await api.deleteArtwork(a._id); load(); } catch (e) { setErr(errorText(e)); }
  };
  const isMine = (a: Artwork) => !!user && (typeof a.user === "object" ? a.user._id : a.user) === user._id;
  const author = (a: Artwork) => (typeof a.user === "object" ? (isMine(a) ? "you" : a.user.name) : "you");

  const emptyText =
    scope === "mine" ? "You haven't saved anything yet. Make some art in Explore and press Save."
    : scope === "liked" ? "Nothing liked yet — tap the heart on art you enjoy."
    : q || tag || source ? "No art matches those filters." : "Nothing public yet. Be the first to share something from Explore.";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <h1 className="text-4xl font-bold tracking-tight">Gallery</h1>
      <p className="mt-2 text-zinc-400">ASCII art saved by the community, and your own creations.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {SCOPES.map((s) => (
          <button key={s.id} onClick={() => { if (s.needsLogin && !user) return onNeedAuth(); setScope(s.id); reset(); }} className={chip(scope === s.id)}>{s.label}</button>
        ))}
        <form className="ml-auto flex gap-2" onSubmit={(e) => { e.preventDefault(); setQ(search.trim()); reset(); }}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search titles" className="w-44 rounded-lg border border-zinc-700 bg-zinc-900 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-emerald-400 sm:w-56" />
          </div>
          <button className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black">Search</button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        {SOURCES.map((s) => <button key={s.id} onClick={() => { setSource(s.id); reset(); }} className={chip(source === s.id)}>{s.label}</button>)}
        <select value={sort} onChange={(e) => { setSort(e.target.value as "new" | "top"); reset(); }} aria-label="Sort" className="ml-auto rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm outline-none focus:border-emerald-400">
          <option value="new">Newest first</option>
          <option value="top">Most liked</option>
        </select>
      </div>

      {(tag || q) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {tag && <button className={btn} onClick={() => { setTag(""); reset(); }}>#{tag} <X className="h-3 w-3" /></button>}
          {q && <button className={btn} onClick={() => { setQ(""); setSearch(""); reset(); }}>“{q}” <X className="h-3 w-3" /></button>}
        </div>
      )}

      {err && <p role="alert" className="mt-4 text-sm text-amber-400">{err}</p>}
      {loading ? <p className="mt-10 text-zinc-500">Loading…</p> : items.length === 0 ? (
        <p className="mt-10 text-zinc-500">{emptyText}</p>
      ) : (<>
        <p className="mt-5 text-xs text-zinc-500">{total} {total === 1 ? "piece" : "pieces"}</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <article key={a._id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition-colors hover:border-zinc-700">
              <Link to={`/gallery/${a._id}`} className="flex aspect-video items-center justify-center bg-black" aria-label={`Open ${a.title}`}>
                {a.thumbnail ? <img src={a.thumbnail} alt={a.title} loading="lazy" className="max-h-full max-w-full object-contain" /> : <span className="font-mono text-zinc-600">░▒▓█</span>}
              </Link>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="truncate font-semibold">{a.title}</h3>
                <p className="flex items-center gap-1 text-xs text-zinc-500">
                  {a.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />} {author(a)} · {a.cols}×{a.rowCount} · {new Date(a.createdAt).toLocaleDateString()}
                </p>
                {a.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {a.tags.map((t) => <button key={t} onClick={() => { setTag(t); reset(); }} className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-emerald-400">#{t}</button>)}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {a.isPublic && <LikeButton id={a._id} liked={a.likedByMe} count={a.likeCount} onNeedAuth={onNeedAuth} onChange={(liked, likeCount) => patch(a._id, { likedByMe: liked, likeCount })} />}
                  <Link to={`/gallery/${a._id}`} className={btn}><Eye className="h-3 w-3" /> View</Link>
                  {isMine(a) && scope === "mine" && (<>
                    <button className={btn} onClick={() => rename(a)}><Pencil className="h-3 w-3" /> Rename</button>
                    <button className={btn} onClick={() => toggle(a)}>{a.isPublic ? <EyeOff className="h-3 w-3" /> : <Globe className="h-3 w-3" />} {a.isPublic ? "Make private" : "Make public"}</button>
                    <button className={cn(btn, "hover:border-red-500 hover:text-red-400")} onClick={() => remove(a)}><Trash2 className="h-3 w-3" /> Delete</button>
                  </>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </>)}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className={cn(btn, "disabled:opacity-40")}>Previous</button>
          <span className="text-zinc-400">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className={cn(btn, "disabled:opacity-40")}>Next</button>
        </div>
      )}
    </div>
  );
}
