import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import artworkRoutes from "./routes/artworks.js";
import presetRoutes from "./routes/presets.js";
import faqRoutes from "./routes/faqs.js";
import { notFound, errorHandler } from "./middleware/error.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "6mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/presets", presetRoutes);
app.use("/api/faqs", faqRoutes);

app.use(notFound);
app.use(errorHandler);
