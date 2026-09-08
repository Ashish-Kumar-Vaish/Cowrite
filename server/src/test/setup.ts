import "../loadEnv.js";
import { execSync } from "child_process";
import { beforeAll, afterAll } from "vitest";
import { prisma } from "../config/db.js";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";

beforeAll(() => {
  try {
    execSync("npx prisma migrate deploy", {
      env: { ...process.env },
      stdio: "pipe",
    });
  } catch (error: any) {
    const output =
      (error.stdout?.toString() ?? "") + (error.stderr?.toString() ?? "");

    if (
      output.includes("No pending migrations") ||
      output.includes("already in sync")
    ) {
      return;
    }

    logger.error(
      { output },
      "Failed to apply Prisma migrations before test run",
    );

    throw error;
  }
}, 60000);

afterAll(async () => {
  await redis.flushdb();
  await prisma.$disconnect();
  await redis.quit();
});
