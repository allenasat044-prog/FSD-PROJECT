import "dotenv/config";

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ascii_cam",
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret",
  jwtExpires: process.env.JWT_EXPIRES || "7d",
  clientOrigin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
};
