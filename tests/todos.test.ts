import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetTodos } from "../src/routes/todos";

beforeEach(() => resetTodos());

describe("GET /api/todos", () => {
  it("returns empty array initially", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all todos", async () => {
    await request(app).post("/api/todos").send({ title: "Buy milk" });
    await request(app).post("/api/todos").send({ title: "Walk dog" });
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /api/todos/:id", () => {
  it("returns a todo by id", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app).get(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Buy milk");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/todos/999");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/todos", () => {
  it("creates a todo", async () => {
    const res = await request(app).post("/api/todos").send({ title: "Buy milk" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ title: "Buy milk", completed: false });
    expect(res.body.id).toBeDefined();
  });

  it("returns 400 when title is missing", async () => {
    const res = await request(app).post("/api/todos").send({});
    expect(res.status).toBe(400);
  });

  it("returns 400 when title is empty string", async () => {
    const res = await request(app).post("/api/todos").send({ title: "   " });
    expect(res.status).toBe(400);
  });
});

describe("PUT /api/todos/:id", () => {
  it("updates title", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ title: "Buy oat milk" });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Buy oat milk");
  });

  it("updates completed", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).put("/api/todos/999").send({ title: "x" });
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid title", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ title: "" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid completed", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ completed: "yes" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("deletes a todo", async () => {
    const created = await request(app).post("/api/todos").send({ title: "Buy milk" });
    const res = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(204);
    const get = await request(app).get(`/api/todos/${created.body.id}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).delete("/api/todos/999");
    expect(res.status).toBe(404);
  });
});
