import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    cols: { type: Number, min: 20, max: 500, required: true },
    contrast: { type: Number, min: 0.3, max: 3, required: true },
    brightness: { type: Number, min: -0.5, max: 0.5, required: true },
    charset: { type: String, enum: ["detailed", "classic", "blocks", "binary", "matrix"], required: true },
    mode: { type: String, enum: ["green", "amber", "color"], required: true },
    invert: { type: Boolean, default: false },
    mirror: { type: Boolean, default: false },
  },
  { _id: false }
);

const artworkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    text: { type: String, required: true },            // the ASCII art itself (rows joined by \n)
    thumbnail: { type: String, default: "" },           // small data-URL preview for the gallery
    cols: { type: Number, required: true },
    rowCount: { type: Number, required: true },
    settings: { type: settingsSchema, required: true },
    sourceType: { type: String, enum: ["camera", "video", "image"], required: true },
    isPublic: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [] }, // who liked it (one like per user)
    likeCount: { type: Number, default: 0, min: 0 },                                       // denormalised so "Top" sorting is a plain index lookup
  },
  { timestamps: true }
);

artworkSchema.index({ isPublic: 1, createdAt: -1 });
artworkSchema.index({ isPublic: 1, likeCount: -1, createdAt: -1 });
artworkSchema.index({ isPublic: 1, tags: 1 });
artworkSchema.index({ user: 1, createdAt: -1 });

export const Artwork = mongoose.model("Artwork", artworkSchema);
