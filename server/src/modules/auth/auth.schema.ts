import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/) // Allows uppercase input but converts to lowercase for consistency
    .toLowerCase(),
  email: z.email().toLowerCase(), // toLowerCase email to ensure uniqueness and consistency
  password: z.string().min(8).max(72),
});

export const loginSchema = z.object({
  identifier: z.string().min(3).max(255).trim().toLowerCase(),
  password: z.string().min(8).max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
