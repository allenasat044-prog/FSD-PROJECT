import { Router } from "express";
import { Faq } from "../models/Faq.js";
import { asyncHandler } from "../middleware/error.js";

const r = Router();
r.get("/", asyncHandler(async (_req, res) => res.json({ items: await Faq.find().sort("order").lean() })));
export default r;
