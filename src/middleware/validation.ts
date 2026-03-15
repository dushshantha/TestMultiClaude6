import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export interface ValidatedRequest<T = any> extends Request {
  validatedBody?: T;
  validatedQuery?: any;
  validatedParams?: any;
}

/**
 * Creates a middleware to validate request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: ValidatedRequest<T>, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({ error: errors });
      return;
    }

    req.validatedBody = result.data;
    next();
  };
}

/**
 * Creates a middleware to validate query parameters against a Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({ error: errors });
      return;
    }

    req.validatedQuery = result.data;
    next();
  };
}

/**
 * Creates a middleware to validate route parameters against a Zod schema
 */
export function validateParams<T>(schema: ZodSchema<T>) {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      res.status(400).json({ error: errors });
      return;
    }

    req.validatedParams = result.data;
    next();
  };
}

/**
 * Formats Zod validation errors into a structured response
 */
export function formatZodErrors(error: ZodError): Record<string, Array<{ message: string; code: string }>> {
  const formatted: Record<string, Array<{ message: string; code: string }>> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push({
      message: issue.message,
      code: issue.code,
    });
  });

  return formatted;
}
