import { Router } from "express";
import * as c from "../controllers/artworks.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { artworkCreateSchema, artworkUpdateSchema, artworkListQuery } from "../validators.js";

const r = Router();
r.get("/", optionalAuth, validate(artworkListQuery, "query"), c.list);
r.get("/:id", optionalAuth, c.getOne);
r.post("/", requireAuth, validate(artworkCreateSchema), c.create);
r.patch("/:id", requireAuth, validate(artworkUpdateSchema), c.update);
r.delete("/:id", requireAuth, c.remove);
export default r;
