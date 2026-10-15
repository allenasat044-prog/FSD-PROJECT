import { Preset } from "../models/Preset.js";
import { AppError, asyncHandler } from "../middleware/error.js";

export const list = asyncHandler(async (req, res) => {
  res.json({ items: await Preset.find({ user: req.user._id }).sort("name") });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ preset: await Preset.create({ ...req.body, user: req.user._id }) });
});

export const update = asyncHandler(async (req, res) => {
  const preset = await Preset.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true });
  if (!preset) throw new AppError(404, "Preset not found");
  res.json({ preset });
});

export const remove = asyncHandler(async (req, res) => {
  const preset = await Preset.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!preset) throw new AppError(404, "Preset not found");
  res.status(204).end();
});
