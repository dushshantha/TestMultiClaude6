import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "./auth";

describe("JWT utilities", () => {
  it("signs and verifies a token", () => {
    const payload = { sub: "user-123", username: "alice" };
    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.sub).toBe("user-123");
    expect(decoded.username).toBe("alice");
  });

  it("throws on invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
