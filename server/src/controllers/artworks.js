import { Artwork } from "../models/Artwork.js";
import { AppError, asyncHandler } from "../middleware/error.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Turn a stored document into what the client needs: no raw `likes` array, but a likedByMe flag.
function present(doc, user) {
  const { likes = [], ...rest } = doc;
  return { ...rest, likedByMe: !!user && likes.some((id) => String(id) === String(user._id)) };
}

// READ (list) — public gallery, or the signed-in user's own art. The heavy `text` field is left out.
export const list = asyncHandler(async (req, res) => {
  const { scope, page, limit, search, sort, source, tag } = req.query;
  const filter = {};
  if (scope === "mine") {
    if (!req.user) throw new AppError(401, "Authentication required");
    filter.user = req.user._id;
  } else if (scope === "liked") {
    if (!req.user) throw new AppError(401, "Authentication required");
    filter.isPublic = true;
    filter.likes = req.user._id;
  } else filter.isPublic = true;
  if (search) filter.title = new RegExp(escapeRegex(search), "i");
  if (source) filter.sourceType = source;
  if (tag) filter.tags = tag;
  const order = sort === "top" ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };

  const [items, total] = await Promise.all([
    Artwork.find(filter).select("-text").populate("user", "name").sort(order).skip((page - 1) * limit).limit(limit).lean(),
    Artwork.countDocuments(filter),
  ]);
  res.json({ items: items.map((a) => present(a, req.user)), page, limit, total, pages: Math.ceil(total / limit) });
});

// READ (one) — includes the full ASCII text. Private art is only visible to its owner.
export const getOne = asyncHandler(async (req, res) => {
  const art = await Artwork.findById(req.params.id).populate("user", "name").lean();
  const isOwner = art && req.user && String(art.user._id) === String(req.user._id);
  if (!art || (!art.isPublic && !isOwner)) throw new AppError(404, "Artwork not found");
  res.json({ artwork: present(art, req.user) });
});

// CREATE
export const create = asyncHandler(async (req, res) => {
  const art = await Artwork.create({ ...req.body, user: req.user._id });
  const { text, likes, ...rest } = art.toObject();
  res.status(201).json({ artwork: { ...rest, likedByMe: false } });
});

// UPDATE (title / visibility / tags) — owner only
export const update = asyncHandler(async (req, res) => {
  const art = await Artwork.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }).select("-text").lean();
  if (!art) throw new AppError(404, "Artwork not found");
  res.json({ artwork: present(art, req.user) });
});

// DELETE — owner only
export const remove = asyncHandler(async (req, res) => {
  const art = await Artwork.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!art) throw new AppError(404, "Artwork not found");
  res.status(204).end();
});

// LIKE / UNLIKE (toggle) — any signed-in user, public art only (or your own).
// Each update is guarded by the filter, so a double-click can never count twice.
export const toggleLike = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const art = await Artwork.findById(req.params.id).select("isPublic user likes likeCount").lean();
  const isOwner = art && String(art.user) === String(uid);
  if (!art || (!art.isPublic && !isOwner)) throw new AppError(404, "Artwork not found");

  const liked = art.likes.some((id) => String(id) === String(uid));
  const updated = liked
    ? await Artwork.findOneAndUpdate({ _id: art._id, likes: uid }, { $pull: { likes: uid }, $inc: { likeCount: -1 } }, { new: true }).select("likeCount").lean()
    : await Artwork.findOneAndUpdate({ _id: art._id, likes: { $ne: uid } }, { $addToSet: { likes: uid }, $inc: { likeCount: 1 } }, { new: true }).select("likeCount").lean();
  const likeCount = updated ? updated.likeCount : art.likeCount; // null = someone else's request already did it
  res.json({ liked: updated ? !liked : liked, likeCount });
});
