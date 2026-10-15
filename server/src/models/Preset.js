import mongoose from "mongoose";

const presetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    settings: {
      cols: Number, contrast: Number, brightness: Number,
      charset: String, mode: String, invert: Boolean, mirror: Boolean,
    },
  },
  { timestamps: true }
);
presetSchema.index({ user: 1, name: 1 }, { unique: true }); // one preset name per user

export const Preset = mongoose.model("Preset", presetSchema);
