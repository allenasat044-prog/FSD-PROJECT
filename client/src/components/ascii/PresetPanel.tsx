import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, errorText, type Preset } from "@/lib/api";
import type { Settings } from "@/lib/ascii";

export default function PresetPanel({ settings, onApply }: { settings: Settings; onApply: (s: Settings) => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<Preset[]>([]);
  const [sel, setSel] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(() => { if (user) api.listPresets().then(setItems).catch((e) => setMsg(errorText(e))); }, [user]);
  useEffect(load, [load]);
  if (!user) return null;

  const add = async () => {
    if (!name.trim()) return setMsg("Name the preset.");
    try { await api.createPreset({ name: name.trim(), settings }); setName(""); setMsg("Preset saved."); load(); } catch (e) { setMsg(errorText(e)); }
  };
  const del = async () => { if (!sel) return; try { await api.deletePreset(sel); setSel(""); load(); } catch (e) { setMsg(errorText(e)); } };
  const apply = () => { const p = items.find((i) => i._id === sel); if (p) onApply(p.settings); };

  const f = "rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400";
  return (
    <div className="flex flex-col gap-2 border-t border-zinc-800 pt-4">
      <h3 className="text-sm font-semibold">My presets</h3>
      <select className={f} value={sel} onChange={(e) => setSel(e.target.value)}>
        <option value="">{items.length ? "Choose a preset" : "No presets yet"}</option>
        {items.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={apply} disabled={!sel} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm disabled:opacity-40">Apply</button>
        <button onClick={del} disabled={!sel} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm hover:border-red-500 disabled:opacity-40">Delete</button>
      </div>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="New preset name" className={`${f} min-w-0 flex-1`} />
        <button onClick={add} className="rounded-lg bg-white px-3 text-sm font-semibold text-black">Save</button>
      </div>
      {msg && <p className="text-xs text-amber-400">{msg}</p>}
    </div>
  );
}
