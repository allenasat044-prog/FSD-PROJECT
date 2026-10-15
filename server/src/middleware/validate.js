// validate(schema, "body" | "query") — replaces the request part with the parsed (typed, trimmed) value
export const validate = (schema, part = "body") => (req, _res, next) => {
  req[part] = schema.parse(req[part]);
  next();
};
