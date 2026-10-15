import { Router } from "express";
import * as c from "../controllers/presets.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { presetSchema } from "../validators.js";

const r = Router();
r.use(requireAuth);
r.get("/", c.list);
r.post("/", validate(presetSchema), c.create);
r.put("/:id", validate(presetSchema), c.update);
r.delete("/:id", c.remove);
export default r;
