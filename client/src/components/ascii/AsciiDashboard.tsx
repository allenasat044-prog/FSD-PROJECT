import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Film, Image as ImageIcon, Download, Copy, SwitchCamera } from "lucide-react";
import { cn } from "@/lib/utils";
import SavePanel, { type Snapshot } from "@/components/ascii/SavePanel";
import PresetPanel from "@/components/ascii/PresetPanel";
import { CHARSETS, frameToSvg, renderAscii, saveBlob, type CharsetKey, type Frame, type Mode, type Settings, type Source } from "@/lib/ascii";

type Kind = "" | "cam" | "vid" | "img";
type Tab = "cam" | "vid" | "img";
type Fmt = "png" | "jpg" | "webp" | "svg" | "txt";

const field = "w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

export default function AsciiDashboard({ onNeedAuth }: { onNeedAuth: () => void }) {
  const [tab, setTab] = useState<Tab>("cam");
  const [s, setS] = useState<Settings>({ cols: 120, contrast: 1.2, brightness: 0, charset: "detailed", mode: "green", invert: false, mirror: false });
  const [fmt, setFmt] = useState<Fmt>("png");
  const [msg, setMsg] = useState("");
  const [hud, setHud] = useState("");
  const [hasFrame, setHasFrame] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const outRef = useRef<HTMLCanvasElement>(null);
  const off = useMemo(() => document.createElement("canvas"), []);
  const src = useRef<Source | null>(null);
  const kind = useRef<Kind>("");
  const stream = useRef<MediaStream | null>(null);
  const face = useRef<"user" | "environment">("user");
  const settings = useRef(s);
  const eff = useRef(s.cols);
  const frame = useRef<Frame | null>(null);
  const fps = useRef({ n: 0, t: performance.now(), v: 0 });
  settings.current = s;

  const isLive = () => kind.current === "cam" || (kind.current === "vid" && !!videoRef.current && !videoRef.current.paused && !videoRef.current.ended);

  const draw = useCallback(() => {
    if (!src.current || !outRef.current) return;
    const live = isLive();
    const cols = settings.current.cols;
    const c = live ? Math.min(eff.current, cols) : cols;
    const t0 = performance.now();
    const f = renderAscii(src.current, c, settings.current, off, outRef.current);
    if (!f) return;
    frame.current = f;
    setHasFrame(true);
    if (live) {
      const ms = performance.now() - t0;
      if (ms > 15) eff.current = Math.max(40, Math.floor(eff.current * 0.9));
      else if (ms < 8 && eff.current < cols) eff.current = Math.min(cols, eff.current + 6);
    } else eff.current = cols;
    const k = fps.current;
    k.n++;
    const now = performance.now();
    if (now - k.t > 700) { k.v = Math.round((k.n * 1000) / (now - k.t)); k.n = 0; k.t = now; setHud(`${f.cols}×${f.rowCount}${live ? ` · ${k.v} fps` : ""}`); }
  }, [off]);

  // render loop for live sources
  useEffect(() => {
    let raf = 0;
    const loop = () => { if (isLive()) draw(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  // re-render still sources when settings change
  useEffect(() => { eff.current = s.cols; if (!isLive()) draw(); }, [s, draw]);

  const stopAll = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    const v = videoRef.current;
    if (v) { v.pause(); v.srcObject = null; v.removeAttribute("src"); v.controls = false; }
    setShowVideo(false);
  };
  useEffect(() => () => stopAll(), []);

  const startCam = async () => {
    stopAll(); setMsg("");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: face.current, width: { ideal: 1280 } }, audio: false });
      const v = videoRef.current!;
      v.srcObject = stream.current; v.loop = false;
      await v.play();
      src.current = v; kind.current = "cam";
      eff.current = Math.min(settings.current.cols, 160);
      setS((p) => ({ ...p, mirror: face.current === "user" }));
    } catch (e) {
      setMsg(`Camera unavailable (${(e as Error).name}). Allow camera access, or use the Video or Image tab.`);
    }
  };
  const flip = () => { face.current = face.current === "user" ? "environment" : "user"; startCam(); };

  const loadVideo = (f: File) => {
    stopAll(); setMsg("");
    const v = videoRef.current!;
    v.src = URL.createObjectURL(f); v.loop = true; v.controls = true; v.muted = true;
    setShowVideo(true);
    v.onloadeddata = () => { src.current = v; kind.current = "vid"; eff.current = Math.min(settings.current.cols, 160); setS((p) => ({ ...p, mirror: false })); v.play().catch(() => {}); };
    v.onpause = () => setTimeout(draw, 30);
    v.onseeked = () => { if (!isLive()) draw(); };
  };
  const loadImage = (f: File) => {
    stopAll(); setMsg("");
    const im = new Image();
    im.onload = () => { src.current = im; kind.current = "img"; setS((p) => ({ ...p, mirror: false })); };
    im.onerror = () => setMsg("Could not read that image.");
    im.src = URL.createObjectURL(f);
  };
  const onFile = (f?: File | null) => {
    if (!f) return;
    if (f.type.startsWith("video")) { setTab("vid"); loadVideo(f); }
    else if (f.type.startsWith("image")) { setTab("img"); loadImage(f); }
    else setMsg("Unsupported file type.");
  };

  const download = () => {
    const f = frame.current;
    if (!f || !outRef.current) return setMsg("Nothing to download yet.");
    setMsg("");
    const base = "ascii-art.";
    if (fmt === "txt") return saveBlob(base + "txt", new Blob([f.rows.join("\n")], { type: "text/plain" }));
    if (fmt === "svg") return saveBlob(base + "svg", new Blob([frameToSvg(f)], { type: "image/svg+xml" }));
    outRef.current.toBlob((b) => b && saveBlob(base + fmt, b), `image/${fmt === "jpg" ? "jpeg" : fmt}`, 0.95);
  };
  const copy = async () => {
    if (!frame.current) return;
    try { await navigator.clipboard.writeText(frame.current.rows.join("\n")); setMsg("Copied to clipboard."); } catch { setMsg("Clipboard is blocked in this browser."); }
  };

  // Snapshot of the current frame for saving to the backend (text + small JPEG thumbnail)
  const snapshot = (): Snapshot | null => {
    const f = frame.current, c = outRef.current;
    if (!f || !c || !kind.current) return null;
    const t = document.createElement("canvas");
    t.width = Math.min(320, c.width);
    t.height = Math.max(1, Math.round((c.height * t.width) / c.width));
    t.getContext("2d")!.drawImage(c, 0, 0, t.width, t.height);
    return {
      text: f.rows.join("\n"), thumbnail: t.toDataURL("image/jpeg", 0.7), cols: f.cols, rowCount: f.rowCount,
      settings: settings.current, sourceType: kind.current === "cam" ? "camera" : kind.current === "vid" ? "video" : "image",
    };
  };

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));
  const tabs: [Tab, string, typeof Camera][] = [["cam", "Camera", Camera], ["vid", "Video", Film], ["img", "Image", ImageIcon]];

  const Drop = ({ accept, label }: { accept: string; label: string }) => (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}
      className="block cursor-pointer rounded-xl border-2 border-dashed border-zinc-700 p-5 text-center text-sm text-zinc-400 hover:border-emerald-400 hover:text-emerald-400"
    >
      {label}
      <input type="file" accept={accept} hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </label>
  );

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4 px-4 pb-10 pt-24 lg:grid-cols-[340px_1fr]">
      <aside className="flex flex-col gap-4 self-start rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className={cn("flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold", tab === k ? "border-zinc-500 bg-zinc-800 text-emerald-400" : "border-zinc-800 bg-zinc-900 text-zinc-300")}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>

        {tab === "cam" && (
          <div className="flex gap-2">
            <button onClick={startCam} className="flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200">Start camera</button>
            <button onClick={flip} title="Switch front / back camera" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3"><SwitchCamera className="h-4 w-4" /></button>
          </div>
        )}
        {tab === "vid" && <Drop accept="video/*" label="Drop a video or click to choose" />}
        {tab === "img" && <Drop accept="image/*" label="Drop an image or click to choose" />}

        <video ref={videoRef} playsInline muted className={cn("max-h-40 w-full rounded-lg bg-black", showVideo ? "block" : "hidden")} />
        <p className="min-h-4 text-xs text-amber-400">{msg}</p>

        <label className="flex flex-col gap-1 text-xs text-zinc-400"><span className="flex justify-between">Resolution (columns) <b className="text-white">{s.cols}</b></span>
          <input type="range" min={20} max={500} value={s.cols} onChange={(e) => set("cols", +e.target.value)} className="accent-emerald-400" /></label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400"><span className="flex justify-between">Contrast <b className="text-white">{s.contrast}</b></span>
          <input type="range" min={0.3} max={3} step={0.05} value={s.contrast} onChange={(e) => set("contrast", +e.target.value)} className="accent-emerald-400" /></label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400"><span className="flex justify-between">Brightness <b className="text-white">{s.brightness}</b></span>
          <input type="range" min={-0.5} max={0.5} step={0.02} value={s.brightness} onChange={(e) => set("brightness", +e.target.value)} className="accent-emerald-400" /></label>

        <label className="flex flex-col gap-1 text-xs text-zinc-400">Character set
          <select className={field} value={s.charset} onChange={(e) => set("charset", e.target.value as CharsetKey)}>
            {(Object.keys(CHARSETS) as CharsetKey[]).map((k) => <option key={k} value={k}>{{ detailed: "Detailed (70 levels)", classic: "Classic", blocks: "Block shading", binary: "Binary", matrix: "Matrix katakana" }[k]}</option>)}
          </select></label>
        <label className="flex flex-col gap-1 text-xs text-zinc-400">Mode
          <select className={field} value={s.mode} onChange={(e) => set("mode", e.target.value as Mode)}>
            <option value="green">Phosphor green</option><option value="amber">Amber</option><option value="color">True color</option>
          </select></label>
        <div className="flex gap-5 text-sm text-zinc-300">
          <label className="flex items-center gap-2"><input type="checkbox" checked={s.invert} onChange={(e) => set("invert", e.target.checked)} className="accent-emerald-400" /> Invert</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={s.mirror} onChange={(e) => set("mirror", e.target.checked)} className="accent-emerald-400" /> Mirror</label>
        </div>

        <label className="flex flex-col gap-1 text-xs text-zinc-400">Download format
          <select className={field} value={fmt} onChange={(e) => setFmt(e.target.value as Fmt)}>
            {["png", "jpg", "webp", "svg", "txt"].map((f) => <option key={f}>{f}</option>)}
          </select></label>
        <div className="flex gap-2">
          <button onClick={download} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-zinc-200"><Download className="h-4 w-4" /> Download</button>
          <button onClick={copy} title="Copy text" className="rounded-lg border border-zinc-700 bg-zinc-900 px-3"><Copy className="h-4 w-4" /></button>
        </div>
        <SavePanel getSnapshot={snapshot} onNeedAuth={onNeedAuth} />
        <PresetPanel settings={s} onApply={setS} />
      </aside>

      <div className="relative flex min-h-[440px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-black p-2">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(transparent_0_2px,rgba(0,0,0,0.18)_2px_3px)]" />
        <span className="absolute right-3 top-2 z-20 font-mono text-[11px] text-emerald-400">{hud}</span>
        {!hasFrame && <p className="absolute px-6 text-center font-mono text-sm text-zinc-500">░▒▓█<br />Start the camera or add a file to see the ASCII output.</p>}
        <canvas ref={outRef} width={2} height={2} className={cn("block h-auto max-h-[78vh] w-auto max-w-full", !hasFrame && "hidden")} />
      </div>
    </div>
  );
}
