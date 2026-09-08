import rateLimit, {
  ipKeyGenerator,
  type RateLimitRequestHandler,
} from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { RateLimitError } from "../error.js";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import type { AuthRequest } from "./auth.js";

const makeStore = (prefix: string) => {
  return new RedisStore({
    prefix,
    sendCommand: (command: string, ...args: string[]) => {
      return redis.call(command, ...args) as unknown as Promise<any>;
    },
  });
};

// Wrapper to bypass rate limiting when redis is down
const withRedisGuard =
  (limiter: RateLimitRequestHandler): RequestHandler =>
  (req, res, next) => {
    if (redis.status !== "ready") {
      return next();
    }

    limiter(req, res, next);
  };

// Generate a key for rate limiting based on user ID or IP address
const userOrIpKeyGenerator = (req: AuthRequest): string => {
  if (req.userId) {
    return req.userId;
  }

  const ip = req.ip ?? req.socket.remoteAddress ?? "anonymous";
  return ipKeyGenerator(ip);
};

export const authLimiter = withRedisGuard(
  rateLimit({
    windowMs: env.NODE_ENV === "production" ? 10 * 60 * 1000 : 5 * 60 * 1000,
    max: env.NODE_ENV === "production" ? 10 : 50,
    store: makeStore("rl:auth:"),
    passOnStoreError: true,
    handler: (req, res, next) => {
      next(new RateLimitError("Too many attempts, please try again later"));
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const aiLimiter = withRedisGuard(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    store: makeStore("rl:ai:"),
    keyGenerator: userOrIpKeyGenerator,
    passOnStoreError: true,
    handler: (req, res, next) => {
      next(new RateLimitError("Too many AI requests, slow down"));
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const searchLimiter = withRedisGuard(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    store: makeStore("rl:search:"),
    keyGenerator: userOrIpKeyGenerator,
    passOnStoreError: true,
    handler: (req, res, next) => {
      next(new RateLimitError("Too many search requests, slow down"));
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

export const exportLimiter = withRedisGuard(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 6,
    store: makeStore("rl:export:"),
    keyGenerator: userOrIpKeyGenerator,
    passOnStoreError: true,
    handler: (req, res, next) => {
      next(new RateLimitError("Too many export requests, slow down"));
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
