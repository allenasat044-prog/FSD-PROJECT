import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, Download, Globe, Lock } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import { api, errorText, type Artwork } from "@/lib/api";
import { saveBlob } from "@/lib/ascii";
import { cn } from "@/lib/utils";

const btn = "flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 hover:border-zinc-500";

// /gallery/:id — one piece, full size. Private art only loads for its owner (the API returns 404 otherwise).
export default function ArtworkPage({ onNeedAuth }: { onNeedAuth: () => void }) {
  const { id = "" } = useParams();
  const [art, setArt] = useState<Artwork | null>(null);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setArt(null); setErr("");
    api.getArtwork(id).then(setArt).catch((e) => setErr(errorText(e)));
  }, [id]);

  const copy = async () => {
    await navigator.clipboard.writeText(art?.text ?? "");
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
      <Link to="/gallery" className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to gallery</Link>
      {err && <p role="alert" className="text-amber-400">{err}</p>}
      {!art && !err && <p className="text-zinc-500">Loading…</p>}
      {art && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{art.title}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-zinc-500">
                {art.isPublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                {typeof art.user === "object" ? art.user.name : "you"} · {art.cols}×{art.rowCount} · {art.sourceType} · {new Date(art.createdAt).toLocaleDateString()}
              </p>
              {art.tags.length > 0 && <p className="mt-2 flex flex-wrap gap-1">{art.tags.map((t) => <span key={t} className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400">#{t}</span>)}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {art.isPublic && <LikeButton id={art._id} liked={art.likedByMe} count={art.likeCount} onNeedAuth={onNeedAuth} onChange={(liked, likeCount) => setArt({ ...art, likedByMe: liked, likeCount })} className="px-2.5 py-1.5" />}
              <button className={btn} onClick={copy}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}</button>
              <button className={btn} onClick={() => saveBlob(`${art.title}.txt`, new Blob([art.text ?? ""], { type: "text/plain" }))}><Download className="h-3 w-3" /> TXT</button>
            </div>
          </div>
          <pre className={cn("max-h-[75vh] overflow-auto rounded-2xl border border-zinc-800 bg-black p-4 font-mono text-[7px] leading-[8px] sm:text-[9px] sm:leading-[10px]", art.settings.mode === "amber" ? "text-amber-400" : "text-emerald-400")}>{art.text}</pre>
        </div>
      )}
    </div>
  );
}
