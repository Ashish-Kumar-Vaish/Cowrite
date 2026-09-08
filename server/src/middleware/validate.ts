import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: z.treeifyError(result.error),
      });
    }

    req.body = result.data;
    next();
  };
}

// Declare a request property to store validated query parameters
// since updating req.query converts number to string which gives prisma error
declare global {
  namespace Express {
    interface Request {
      validatedQuery?: Record<string, unknown>;
    }
  }
}

export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: z.treeifyError(result.error),
      });
    }

    req.validatedQuery = result.data as Record<string, unknown>;
    next();
  };
}
