import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedFaqs } from "./seed/faqs.js";

try {
  await connectDB();
  await seedFaqs();
  app.listen(env.port, () => console.log(`API listening on http://localhost:${env.port}`));
} catch (err) {
  console.error("Could not start the server:", err.message);
  console.error("Is MongoDB running? Check MONGO_URI in server/.env");
  process.exit(1);
}
