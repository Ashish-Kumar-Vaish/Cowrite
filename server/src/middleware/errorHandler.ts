import type { Response, NextFunction } from "express";
import { AppError, ValidationError } from "../error.js";
import { logger } from "../config/logger.js";
import { isDev } from "../config/env.js";
import type { AuthRequest } from "./auth.js";

export function errorHandler(
  err: Error,
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    if (err.status >= 500) {
      logger.error({ err, path: req.path, method: req.method }, err.message);
    } else if (err.status === 403 || err.status === 409) {
      logger.warn({ err, path: req.path, method: req.method }, err.message);
    }

    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      // Attach errors to only ValidationError instances
      // because only ValidationError consists errors property in error.ts
      ...(err instanceof ValidationError &&
        err.errors && { errors: err.errors }),
      ...(isDev && { stack: err.stack }),
    });
  }

  logger.error(
    { err, path: req.path, method: req.method, userId: (req as any).userId },
    "Unexpected error",
  );

  return res.status(500).json({
    message: "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
}
