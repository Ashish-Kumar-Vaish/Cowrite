import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/jwt.js";
import { UnauthorizedError } from "../error.js";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Unauthorized"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new UnauthorizedError("Invalid token"));
    }

    let isBlacklisted = null;

    try {
      // If Redis is down bypass the blacklist check and allow the token to be verified.
      if (redis.status === "ready") {
        isBlacklisted = await redis.get(`blacklist:${token}`);
      }
    } catch (redisError) {
      logger.warn(
        { err: redisError },
        "Redis is down! Bypassing blacklist check.",
      );
    }

    if (isBlacklisted) {
      return next(new UnauthorizedError("Token has been invalidated"));
    }

    const payload = verifyToken(token);
    req.userId = payload.id;
    next();
  } catch (error) {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export async function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    let isBlacklisted = null;

    try {
      if (redis.status === "ready") {
        isBlacklisted = await redis.get(`blacklist:${token}`);
      }
    } catch (redisError) {
      logger.warn(
        { err: redisError },
        "Redis is down! Bypassing blacklist check in optional auth.",
      );
    }

    // If blacklisted continue without the userId
    if (!isBlacklisted) {
      const payload = verifyToken(token);
      req.userId = payload.id;
    }
  } catch (error) {
    // Silently fail and continue without userId
    logger.debug(
      { err: error },
      "optionalAuthenticate: token verification failed, continuing as anonymous",
    );
  }

  next();
}
