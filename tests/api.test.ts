import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("GET /api/health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("returns a valid ISO timestamp", async () => {
    const res = await request(app).get("/api/health");
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(typeof res.body.token).toBe("string");
    expect(res.body.user.username).toBe("testuser");
  });

  it("returns 400 on invalid data", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "",
      email: "bad-email",
      password: "abc",
    });
    expect(res.status).toBe(400);
  });

  it("returns 409 when username is already taken", async () => {
    const payload = {
      username: "dupuser",
      email: "dup@example.com",
      password: "password123",
    };
    await request(app).post("/api/auth/register").send(payload);
    const res = await request(app).post("/api/auth/register").send(payload);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/username/i);
  });

  it("returns 400 when password is too short", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "shortpassuser",
      email: "short@example.com",
      password: "abc",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "noemail",
      password: "password123",
    });
    expect(res.status).toBe(400);
  });

  it("response includes user id", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "idcheckuser",
      email: "idcheck@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(typeof res.body.user.id).toBe("string");
    expect(res.body.user.id.length).toBeGreaterThan(0);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    // Register first
    await request(app).post("/api/auth/register").send({
      username: "loginuser",
      email: "login@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      username: "loginuser",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("returns 401 on wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "loginuser",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 for non-existent username", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "ghostuser",
      password: "password123",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "loginuser",
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when username is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "password123",
    });
    expect(res.status).toBe(400);
  });

  it("login response includes user info", async () => {
    await request(app).post("/api/auth/register").send({
      username: "logininfo",
      email: "logininfo@example.com",
      password: "password123",
    });
    const res = await request(app).post("/api/auth/login").send({
      username: "logininfo",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("logininfo");
    expect(res.body.user.email).toBe("logininfo@example.com");
  });
});

describe("GET /api/auth/me", () => {
  it("returns user info with valid token", async () => {
    const regRes = await request(app).post("/api/auth/register").send({
      username: "meuser",
      email: "me@example.com",
      password: "password123",
    });
    const token = regRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("meuser");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });

  it("returns 401 with malformed authorization header", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "NotBearer sometoken");
    expect(res.status).toBe(401);
  });

  it("token from login also works for /me", async () => {
    await request(app).post("/api/auth/register").send({
      username: "melogin",
      email: "melogin@example.com",
      password: "password123",
    });
    const loginRes = await request(app).post("/api/auth/login").send({
      username: "melogin",
      password: "password123",
    });
    const token = loginRes.body.token;

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("melogin");
  });
});
