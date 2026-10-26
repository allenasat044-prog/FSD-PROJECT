// Fills the public gallery with a few demo pieces so the Gallery page has something to show.
//   npm --prefix server run seed:gallery        (safe to run twice — it skips existing demo art)
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Artwork } from "../models/Artwork.js";

const RAMP = " .:-=+*#%@";
const COLS = 64, ROWS = 28;

// Each shape returns brightness 0..1 for a point (x, y in -1..1).
const shapes = {
  "Neon sun": (x, y) => Math.max(0, 1 - Math.hypot(x, y * 1.1) * 1.15),
  "Ripple pond": (x, y) => (Math.sin(Math.hypot(x, y) * 14) + 1) / 2 * Math.max(0, 1 - Math.hypot(x, y) * 0.8),
  "Sine waves": (x, y) => (Math.sin(x * 9 + Math.sin(y * 4) * 2) * Math.cos(y * 6) + 1) / 2,
  "Diagonal fade": (x, y) => Math.min(1, Math.max(0, (x + y + 2) / 4)),
  "Checker glow": (x, y) => (((Math.floor((x + 1) * 5) + Math.floor((y + 1) * 5)) % 2) ? 0.85 : 0.25) * Math.max(0.2, 1 - Math.hypot(x, y) * 0.6),
  "Spiral": (x, y) => (Math.sin(Math.atan2(y, x) * 3 + Math.hypot(x, y) * 12) + 1) / 2,
};

const render = (fn) =>
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      const v = Math.min(1, Math.max(0, fn((c / (COLS - 1)) * 2 - 1, (r / (ROWS - 1)) * 2 - 1)));
      return RAMP[Math.round(v * (RAMP.length - 1))];
    }).join("")
  ).join("\n");

// Tiny SVG preview used as the card thumbnail (same idea as the JPEG the Explore page saves).
const thumb = (text) => {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lines = text.split("\n").map((l, i) => `<text x="0" y="${(i + 1) * 12}" xml:space="preserve">${esc(l)}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${COLS * 6}" height="${ROWS * 12}" viewBox="0 0 ${COLS * 6} ${ROWS * 12}"><rect width="100%" height="100%" fill="#000"/><g fill="#33ff66" font-family="monospace" font-size="11">${lines}</g></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

await connectDB();
let user = await User.findOne({ email: "demo@ascii-cam.dev" });
if (!user) user = await User.create({ name: "Demo Artist", email: "demo@ascii-cam.dev", passwordHash: await bcrypt.hash(`demo-${Date.now()}`, 10) });

let made = 0;
for (const [title, fn] of Object.entries(shapes)) {
  if (await Artwork.exists({ user: user._id, title })) continue;
  const text = render(fn);
  await Artwork.create({
    user: user._id, title, text, thumbnail: thumb(text), cols: COLS, rowCount: ROWS, sourceType: "image", isPublic: true,
    tags: ["demo", "generated"], likeCount: 0,
    settings: { cols: COLS, contrast: 1, brightness: 0, charset: "classic", mode: "green", invert: false, mirror: false },
  });
  made++;
}
console.log(`Gallery seed done — ${made} new piece(s) added.`);
await mongoose.disconnect();
