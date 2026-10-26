import { useState } from "react";
import { Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, errorText, type NewArtwork } from "@/lib/api";

export type Snapshot = Omit<NewArtwork, "title" | "isPublic" | "tags">;

export default function SavePanel({ getSnapshot, onNeedAuth }: { getSnapshot: () => Snapshot | null; onNeedAuth: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState("");
  const [msg, setMsg] = useState("");

  const save = async () => {
    const snap = getSnapshot();
    if (!snap) return setMsg("Create some ASCII art first.");
    if (!title.trim()) return setMsg("Give your art a title.");
    try {
      const tagList = [...new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 5);
      await api.createArtwork({ ...snap, title: title.trim(), isPublic, tags: tagList });
      setMsg(isPublic ? "Saved — it is now in the public gallery." : "Saved to your gallery (private)."); setTitle(""); setTags("");
    } catch (e) { setMsg(errorText(e)); }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
      <h3 className="text-sm font-semibold">Save to gallery</h3>
      {!user ? (
        <button onClick={onNeedAuth} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:border-emerald-400">Log in to save</button>
      ) : (<>
        <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Title" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated (max 5)" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400" />
        <label className="flex items-center gap-2 text-sm text-zinc-300"><input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-emerald-400" /> Public</label>
        <button onClick={save} className="flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black hover:bg-emerald-300"><Save className="h-4 w-4" /> Save</button>
      </>)}
      {msg && <p className="text-xs text-amber-400">{msg}</p>}
    </div>
  );
}
