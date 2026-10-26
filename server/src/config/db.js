import mongoose from "mongoose";
import { env } from "./env.js";

// Turn the most common connection failures into a message a human can act on.
function explain(err) {
  const m = String(err?.message || err);
  if (/bad auth|Authentication failed/i.test(m)) return "Wrong database username or password in MONGO_URI. (Special characters in the password must be URL-encoded, e.g. @ -> %40.)";
  if (/ENOTFOUND|querySrv|EAI_AGAIN/i.test(m)) return "The cluster address could not be resolved. Re-copy the connection string from Atlas and check your internet connection.";
  if (/ECONNREFUSED/i.test(m)) return "Nothing is listening at that address. For a local database start it first:  docker compose up -d";
  if (/Server selection timed out|ReplicaSetNoPrimary|whitelist|IP/i.test(m)) return "Could not reach the server. On Atlas: Network Access -> add your current IP address (or 0.0.0.0/0 while developing).";
  if (/MONGO_URI/i.test(m)) return m;
  return m;
}

export async function connectDB(uri = env.mongoUri) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  } catch (err) {
    err.message = explain(err);
    throw err;
  }
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected — the driver will keep trying to reconnect"));
  mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
}
