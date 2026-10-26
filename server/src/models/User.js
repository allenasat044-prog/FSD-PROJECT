import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, select: false },          // absent for accounts created via Google/GitHub
    googleId: { type: String, index: true, sparse: true },
    githubId: { type: String, index: true, sparse: true },
    avatar: { type: String, default: "" },
    providers: { type: [String], default: ["password"] },   // how this account can sign in
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; },
});

export const User = mongoose.model("User", userSchema);
