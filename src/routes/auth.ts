import { Router, Request, Response } from "express";
import { LoginSchema, RegisterSchema } from "../schemas/auth";
import { signToken, requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// In-memory user store (to be replaced by DB in future tasks)
const users: Map<string, { id: string; username: string; email: string; passwordHash: string }> = new Map();

router.post("/register", (req: Request, res: Response): void => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { username, email, password } = result.data;

  if (users.has(username)) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const id = crypto.randomUUID();
  // NOTE: In production use bcrypt; this is a scaffold demo
  users.set(username, { id, username, email, passwordHash: password });

  const token = signToken({ sub: id, username });
  res.status(201).json({ token, user: { id, username, email } });
});

router.post("/login", (req: Request, res: Response): void => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const { username, password } = result.data;
  const user = users.get(username);

  if (!user || user.passwordHash !== password) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ sub: user.id, username: user.username });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

router.get("/me", requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.json({ user: req.user });
});

export default router;
