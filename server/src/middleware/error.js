import { ZodError } from "zod";

export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const notFound = (req, _res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message;
  let details = err.details;

  if (err instanceof ZodError) {
    status = 400; message = "Validation failed";
    details = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
  } else if (err.name === "CastError") { status = 400; message = "Invalid id"; }
  else if (err.name === "ValidationError") { status = 400; message = "Validation failed"; }
  else if (err.code === 11000) { status = 409; message = "That value already exists"; }
  else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") { status = 401; message = "Invalid or expired token"; }
  else if (err.type === "entity.too.large") { status = 413; message = "Payload too large"; }
  else if (err.type === "entity.parse.failed") { status = 400; message = "Malformed JSON"; }

  if (status >= 500) { console.error(err); message = "Internal server error"; details = undefined; }
  res.status(status).json({ error: { message, details } });
}
