import { z } from "zod";

export const settingsSchema = z.object({
  cols: z.number().int().min(20).max(500),
  contrast: z.number().min(0.3).max(3),
  brightness: z.number().min(-0.5).max(0.5),
  charset: z.enum(["detailed", "classic", "blocks", "binary", "matrix"]),
  mode: z.enum(["green", "amber", "color"]),
  invert: z.boolean(),
  mirror: z.boolean(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const tags = z.array(z.string().trim().min(1).max(20)).max(5);

export const artworkCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(80),
  text: z.string().min(1).max(300000),
  thumbnail: z.string().max(300000).startsWith("data:image/").optional(),
  cols: z.number().int().min(1).max(500),
  rowCount: z.number().int().min(1).max(2000),
  settings: settingsSchema,
  sourceType: z.enum(["camera", "video", "image"]),
  isPublic: z.boolean().default(false),
  tags: tags.default([]),
});

export const artworkUpdateSchema = z
  .object({ title: z.string().trim().min(1).max(80), isPublic: z.boolean(), tags })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Send at least one field to update");

export const artworkListQuery = z.object({
  scope: z.enum(["public", "mine"]).default("public"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(50).optional(),
});

export const presetSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  settings: settingsSchema,
});
