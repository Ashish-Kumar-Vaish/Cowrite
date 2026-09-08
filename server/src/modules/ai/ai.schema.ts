import { z } from "zod";

export const improveWritingSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Text is required to improve writing")
    .max(20000),
});

export type ImproveWritingInput = z.infer<typeof improveWritingSchema>;