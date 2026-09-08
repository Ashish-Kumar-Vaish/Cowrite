import { Redis } from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

// Same options for both when redis url is provided and when it's not
const sharedOptions = {
  lazyConnect: true,
  retryStrategy: (times: number) => Math.min(times * 500, 3000),
  maxRetriesPerRequest: 1,
};

export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, sharedOptions)
  : new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD,
      tls: env.NODE_ENV === "production" ? {} : undefined,
      ...sharedOptions,
    });

redis.on("connect", () => logger.info("Connected to Redis successfully"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));
