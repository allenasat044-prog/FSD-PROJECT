import { Router } from "express";
import { register, login, me } from "../controllers/auth.js";
import { available, start, callback } from "../controllers/oauth.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators.js";

const r = Router();
r.post("/register", validate(registerSchema), register);
r.post("/login", validate(loginSchema), login);
r.get("/me", requireAuth, me);

r.get("/providers", available);
for (const p of ["google", "github"]) {
  r.get(`/${p}`, start(p));
  r.get(`/${p}/callback`, callback(p));
}
export default r;
