import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .toLowerCase()
    .optional(),
  bio: z.string().max(200).optional(),
});

export const updateEmailSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(1),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export const updateGeminiApiKeySchema = z.object({
  apiKey: z.string().min(1).max(200).nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UpdateGeminiApiKeyInput = z.infer<typeof updateGeminiApiKeySchema>;
