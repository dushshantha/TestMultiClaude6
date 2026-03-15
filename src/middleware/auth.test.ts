import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "./auth";

describe("JWT utilities", () => {
  it("signs and verifies a token", () => {
    const payload = { sub: "550e8400-e29b-41d4-a716-446655440000", username: "alice" };
    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(decoded.username).toBe("alice");
  });

  it("throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
