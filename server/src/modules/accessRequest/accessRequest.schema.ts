import { z } from "zod";

export const requestAccessSchema = z.object({
  requestedRole: z.enum(["EDITOR", "VIEWER"]).default("VIEWER"),
});

export const approveRequestSchema = z
  .object({
    role: z.enum(["EDITOR", "VIEWER"]),
  })
  .strict(); // strict ensures no extra fields are allowed in the request body

export type RequestAccessInput = z.infer<typeof requestAccessSchema>;
export type ApproveRequestInput = z.infer<typeof approveRequestSchema>;
