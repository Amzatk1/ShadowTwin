import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const approvalDecisionSchema = z.object({
  decision: z.enum(["approve", "reject", "snooze", "edit"]),
  note: z.string().max(500).optional(),
});

export const quickCaptureSchema = z.object({
  type: z.enum(["note", "voice", "image", "link"]),
  content: z.string().min(1),
  entityTag: z.string().optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
});

