import { z } from "zod";

export const createSharedLinkSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]).default("VIEWER"),
  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), {
      message: "expiresAt must be in the future",
    })
    .optional(),
});

export type CreateSharedLinkInput = z.infer<typeof createSharedLinkSchema>;
