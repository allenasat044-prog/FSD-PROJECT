import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5001,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ascii_cam",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  serverUrl: process.env.SERVER_URL || `http://localhost:${Number(process.env.PORT) || 5001}`, // public URL of this API (OAuth callbacks)
  google: { id: process.env.GOOGLE_CLIENT_ID || "", secret: process.env.GOOGLE_CLIENT_SECRET || "" },
  github: { id: process.env.GITHUB_CLIENT_ID || "", secret: process.env.GITHUB_CLIENT_SECRET || "" },
  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
};
