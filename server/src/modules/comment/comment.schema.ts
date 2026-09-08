import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1).max(500),
  parentId: z.string().optional(),
  selectedText: z.string().optional(),
  fromPos: z.number().optional(),
  toPos: z.number().optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(500),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
