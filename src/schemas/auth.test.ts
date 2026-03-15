import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema, JwtPayloadSchema } from "./auth";

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({
      username: "alice123",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing username", () => {
    const result = LoginSchema.safeParse({ password: "ValidPass123!" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = LoginSchema.safeParse({ username: "alice123" });
    expect(result.success).toBe(false);
  });

  it("rejects username shorter than 3 characters", () => {
    const result = LoginSchema.safeParse({
      username: "ab",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username with invalid characters", () => {
    const result = LoginSchema.safeParse({
      username: "alice@domain",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts username with hyphens and underscores", () => {
    const result = LoginSchema.safeParse({
      username: "alice_user-123",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(true);
  });
});

describe("RegisterSchema", () => {
  it("accepts valid registration data", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email to lowercase", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "ALICE@EXAMPLE.COM",
      password: "ValidPass123!",
    });
    if (result.success) {
      expect(result.data.email).toBe("alice@example.com");
    }
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "not-an-email",
      password: "ValidPass123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "validpass123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase letter", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "VALIDPASS123!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "ValidPass!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without special character", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "ValidPass123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "Pass1!",
    });
    expect(result.success).toBe(false);
  });

  it("accepts password with various special characters", () => {
    const result = RegisterSchema.safeParse({
      username: "alice123",
      email: "alice@example.com",
      password: "ValidPass@123",
    });
    expect(result.success).toBe(true);
  });
});

describe("JwtPayloadSchema", () => {
  it("accepts valid JWT payload with UUID", () => {
    const result = JwtPayloadSchema.safeParse({
      sub: "550e8400-e29b-41d4-a716-446655440000",
      username: "alice123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID format", () => {
    const result = JwtPayloadSchema.safeParse({
      sub: "not-a-uuid",
      username: "alice123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional iat and exp timestamps", () => {
    const result = JwtPayloadSchema.safeParse({
      sub: "550e8400-e29b-41d4-a716-446655440000",
      username: "alice123",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    expect(result.success).toBe(true);
  });
});
