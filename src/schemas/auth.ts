import { z } from "zod";

// Reusable field schemas for consistency
const usernameField = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must not exceed 20 characters")
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens");

const emailField = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .refine((email) => email.length <= 254, "Email must not exceed 254 characters");

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Password must contain at least one uppercase letter"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Password must contain at least one lowercase letter"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Password must contain at least one digit"
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    "Password must contain at least one special character"
  );

export const LoginSchema = z.object({
  username: usernameField,
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
});

export const JwtPayloadSchema = z.object({
  sub: z.string().uuid("Invalid user ID format"),
  username: usernameField,
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
});

// Error response schema for consistent error handling
export const ValidationErrorSchema = z.object({
  error: z.union([
    z.string(),
    z.record(z.array(z.object({
      message: z.string(),
      code: z.string().optional(),
    }))),
  ]),
});

// Auth response schemas
export const AuthResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string().uuid(),
    username: z.string(),
    email: z.string().email(),
  }),
});

export const UserInfoSchema = z.object({
  user: JwtPayloadSchema,
});

// Request body schemas for explicit typing
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
