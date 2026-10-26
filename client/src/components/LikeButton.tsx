import { useState } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, errorText } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  liked: boolean;
  count: number;
  onNeedAuth: () => void;
  onChange?: (liked: boolean, count: number) => void;
  className?: string;
}

// Optimistic like toggle: the heart flips immediately and rolls back if the API call fails.
export default function LikeButton({ id, liked, count, onNeedAuth, onChange, className }: Props) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (!user) return onNeedAuth();
    if (busy) return;
    setBusy(true);
    onChange?.(!liked, count + (liked ? -1 : 1));
    try {
      const r = await api.toggleLike(id);
      onChange?.(r.liked, r.likeCount);
    } catch (e) {
      onChange?.(liked, count);
      window.alert(errorText(e));
    } finally { setBusy(false); }
  };

  return (
    <button onClick={click} aria-pressed={liked} aria-label={liked ? "Unlike" : "Like"}
      className={cn("flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
        liked ? "border-rose-500/60 bg-rose-500/10 text-rose-400" : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500", className)}>
      <Heart className={cn("h-3 w-3", liked && "fill-current")} /> {count}
    </button>
  );
}
