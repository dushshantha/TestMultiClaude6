import { describe, it, expect } from "vitest";
import { formatZodErrors, validateBody } from "./validation";
import { LoginSchema, RegisterSchema } from "../schemas/auth";
import { z } from "zod";

describe("formatZodErrors", () => {
  it("formats simple validation errors", () => {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(6),
    });

    const result = schema.safeParse({});
    expect(result.success).toBe(false);

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted.username).toBeDefined();
      expect(formatted.password).toBeDefined();
      expect(Array.isArray(formatted.username)).toBe(true);
      expect(formatted.username[0].message).toBeDefined();
      expect(formatted.username[0].code).toBeDefined();
    }
  });

  it("formats nested validation errors", () => {
    const schema = z.object({
      user: z.object({
        username: z.string().min(1),
        email: z.string().email(),
      }),
    });

    const result = schema.safeParse({
      user: { username: "", email: "invalid" },
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      const formatted = formatZodErrors(result.error);
      expect(formatted["user.username"]).toBeDefined();
      expect(formatted["user.email"]).toBeDefined();
    }
  });
});

describe("validateBody middleware", () => {
  it("allows valid request bodies to pass through", () => {
    const middleware = validateBody(LoginSchema);
    let nextCalled = false;

    const req = {
      body: { username: "testuser", password: "password123" },
    } as any;
    const res = {} as any;
    const next = () => {
      nextCalled = true;
    };

    middleware(req, res, next);
    expect(nextCalled).toBe(true);
    expect(req.validatedBody).toBeDefined();
  });

  it("rejects invalid request bodies with 400 status", () => {
    const middleware = validateBody(LoginSchema);
    let jsonCalled = false;
    let statusCode = 0;

    const req = {
      body: { username: "test" },
    } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            jsonCalled = true;
          },
        };
      },
    } as any;
    const next = () => {};

    middleware(req, res, next);
    expect(statusCode).toBe(400);
    expect(jsonCalled).toBe(true);
  });
});
