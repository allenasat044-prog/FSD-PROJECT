// End-to-end CRUD test. Needs a real MongoDB:  MONGO_URI_TEST=mongodb://127.0.0.1:27017/ascii_cam_test npm test
import test, { after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";

const uri = process.env.MONGO_URI_TEST;
const settings = { cols: 40, contrast: 1.2, brightness: 0, charset: "classic", mode: "green", invert: false, mirror: false };

test("auth + artwork + preset CRUD flow", { skip: !uri && "set MONGO_URI_TEST to run" }, async () => {
  await connectDB(uri);
  await mongoose.connection.dropDatabase();
  const email = "tester@example.com";

  const reg = await request(app).post("/api/auth/register").send({ name: "Tester", email, password: "password123" });
  assert.equal(reg.status, 201);
  assert.equal((await request(app).post("/api/auth/register").send({ name: "Tester", email, password: "password123" })).status, 409);
  assert.equal((await request(app).post("/api/auth/login").send({ email, password: "wrong-password" })).status, 401);
  const token = (await request(app).post("/api/auth/login").send({ email, password: "password123" })).body.token;
  const auth = { Authorization: `Bearer ${token}` };

  // CREATE
  const created = await request(app).post("/api/artworks").set(auth).send({ title: "First", text: "@@@\n@@@", cols: 3, rowCount: 2, settings, sourceType: "image" });
  assert.equal(created.status, 201);
  const id = created.body.artwork._id;
  // READ: private art is hidden from anonymous users, visible to the owner
  assert.equal((await request(app).get(`/api/artworks/${id}`)).status, 404);
  assert.equal((await request(app).get(`/api/artworks/${id}`).set(auth)).body.artwork.text, "@@@\n@@@");
  assert.equal((await request(app).get("/api/artworks?scope=public")).body.total, 0);
  // UPDATE: make it public
  assert.equal((await request(app).patch(`/api/artworks/${id}`).set(auth).send({ isPublic: true, title: "Renamed" })).body.artwork.title, "Renamed");
  assert.equal((await request(app).get("/api/artworks?scope=public")).body.total, 1);
  assert.equal((await request(app).get("/api/artworks?scope=mine").set(auth)).body.total, 1);
  // DELETE
  assert.equal((await request(app).delete(`/api/artworks/${id}`).set(auth)).status, 204);
  assert.equal((await request(app).get(`/api/artworks/${id}`).set(auth)).status, 404);

  // presets
  const p = await request(app).post("/api/presets").set(auth).send({ name: "Retro", settings });
  assert.equal(p.status, 201);
  assert.equal((await request(app).post("/api/presets").set(auth).send({ name: "Retro", settings })).status, 409);
  assert.equal((await request(app).delete(`/api/presets/${p.body.preset._id}`).set(auth)).status, 204);
});

after(async () => { await mongoose.disconnect(); });
