import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "./auth";

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({ username: "alice", password: "secret123" });
    expect(result.success).toBe(true);
  });

  it("rejects missing username", () => {
    const result = LoginSchema.safeParse({ password: "secret123" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = LoginSchema.safeParse({ username: "alice", password: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("RegisterSchema", () => {
  it("accepts valid registration data", () => {
    const result = RegisterSchema.safeParse({
      username: "alice",
      email: "alice@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = RegisterSchema.safeParse({
      username: "alice",
      email: "not-an-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });
});
