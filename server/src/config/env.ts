import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  PORT: z.coerce.number().default(3000),
  WS_PORT: z.coerce.number().default(1234),

  FRONTEND_URL: z.url(),
  DATABASE_URL: z.string().min(1), // string because prisma expects url to be a string

  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  GEMINI_API_KEY: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");

  console.dir(z.flattenError(parsed.error).fieldErrors, {
    depth: null,
    colors: true,
  });

  process.exit(1);
}

export const env = parsed.data;
export const isDev = env.NODE_ENV !== "production";