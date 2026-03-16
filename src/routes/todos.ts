import { Router, Request, Response } from "express";

const router = Router();

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

let todos: Todo[] = [];
let nextId = 1;

export function resetTodos(): void {
  todos = [];
  nextId = 1;
}

// GET /api/todos
router.get("/", (_req: Request, res: Response): void => {
  res.json(todos);
});

// GET /api/todos/:id
router.get("/:id", (req: Request, res: Response): void => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id as string));
  if (!todo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(todo);
});

// POST /api/todos
router.post("/", (req: Request, res: Response): void => {
  const { title } = req.body as { title?: unknown };
  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ error: "title is required" });
    return;
  }
  const todo: Todo = { id: nextId++, title: title.trim(), completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

// PUT /api/todos/:id
router.put("/:id", (req: Request, res: Response): void => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id as string));
  if (!todo) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const { title, completed } = req.body as { title?: unknown; completed?: unknown };
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: "title must be a non-empty string" });
      return;
    }
    todo.title = title.trim();
  }
  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      res.status(400).json({ error: "completed must be a boolean" });
      return;
    }
    todo.completed = completed;
  }
  res.json(todo);
});

// DELETE /api/todos/:id
router.delete("/:id", (req: Request, res: Response): void => {
  const idx = todos.findIndex((t) => t.id === parseInt(req.params.id as string));
  if (idx === -1) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  todos.splice(idx, 1);
  res.status(204).send();
});

export default router;
