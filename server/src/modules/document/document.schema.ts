import { z } from "zod";

export const paginationQuerySchema = z.object({
  // Coerce to number converts string inputs to numbers
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getAllDocumentsQuerySchema = paginationQuerySchema.extend({
  filter: z.enum(["all", "mine", "shared"]).default("all"),
});

export const createDocumentSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const UpdateDocumentTitleSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const updateVisibilitySchema = z.object({
  isPublic: z.boolean(),
});

export const addCollaboratorSchema = z.object({
  userId: z.string(),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const exportQuerySchema = z.object({
  format: z.enum(["pdf", "docx"]),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type GetAllDocumentsQuery = z.infer<typeof getAllDocumentsQuerySchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentTitleInput = z.infer<
  typeof UpdateDocumentTitleSchema
>;
export type UpdateVisibilityInput = z.infer<typeof updateVisibilitySchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
export type ExportQuery = z.infer<typeof exportQuerySchema>;
