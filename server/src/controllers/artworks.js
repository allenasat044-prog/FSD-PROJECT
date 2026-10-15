import { Artwork } from "../models/Artwork.js";
import { AppError, asyncHandler } from "../middleware/error.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// READ (list) — public gallery, or the signed-in user's own art. The heavy `text` field is left out.
export const list = asyncHandler(async (req, res) => {
  const { scope, page, limit, search } = req.query;
  const filter = {};
  if (scope === "mine") {
    if (!req.user) throw new AppError(401, "Authentication required");
    filter.user = req.user._id;
  } else filter.isPublic = true;
  if (search) filter.title = new RegExp(escapeRegex(search), "i");

  const [items, total] = await Promise.all([
    Artwork.find(filter).select("-text").populate("user", "name").sort("-createdAt").skip((page - 1) * limit).limit(limit).lean(),
    Artwork.countDocuments(filter),
  ]);
  res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
});

// READ (one) — includes the full ASCII text. Private art is only visible to its owner.
export const getOne = asyncHandler(async (req, res) => {
  const art = await Artwork.findById(req.params.id).populate("user", "name");
  const isOwner = art && req.user && String(art.user._id) === String(req.user._id);
  if (!art || (!art.isPublic && !isOwner)) throw new AppError(404, "Artwork not found");
  res.json({ artwork: art });
});

// CREATE
export const create = asyncHandler(async (req, res) => {
  const art = await Artwork.create({ ...req.body, user: req.user._id });
  const { text, ...rest } = art.toObject();
  res.status(201).json({ artwork: rest });
});

// UPDATE (title / visibility / tags) — owner only
export const update = asyncHandler(async (req, res) => {
  const art = await Artwork.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }).select("-text");
  if (!art) throw new AppError(404, "Artwork not found");
  res.json({ artwork: art });
});

// DELETE — owner only
export const remove = asyncHandler(async (req, res) => {
  const art = await Artwork.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!art) throw new AppError(404, "Artwork not found");
  res.status(204).end();
});
