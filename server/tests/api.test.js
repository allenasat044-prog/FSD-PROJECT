// Runs without a database: checks routing, validation and auth guards.
import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/app.js";

test("GET /api/health returns ok", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "ok");
});

test("unknown route returns a JSON 404", async () => {
  const res = await request(app).get("/api/nope");
  assert.equal(res.status, 404);
  assert.ok(res.body.error.message);
});

test("register rejects a short password and bad email with 400", async () => {
  const res = await request(app).post("/api/auth/register").send({ name: "A", email: "nope", password: "123" });
  assert.equal(res.status, 400);
  assert.ok(res.body.error.details.length >= 2);
});

test("malformed JSON returns 400", async () => {
  const res = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{bad");
  assert.equal(res.status, 400);
});

test("protected routes require a token", async () => {
  for (const [method, url] of [["get", "/api/auth/me"], ["post", "/api/artworks"], ["get", "/api/presets"], ["delete", "/api/artworks/123"], ["post", "/api/artworks/123/like"]]) {
    const res = await request(app)[method](url).send({});
    assert.equal(res.status, 401, `${method} ${url}`);
  }
});

test("a bad token is rejected with 401", async () => {
  const res = await request(app).get("/api/auth/me").set("Authorization", "Bearer not-a-real-token");
  assert.equal(res.status, 401);
});
