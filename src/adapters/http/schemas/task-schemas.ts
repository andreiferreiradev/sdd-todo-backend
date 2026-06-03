import { z } from "zod";

export const createTaskSchema = z.strictObject({
  title: z.string().trim().min(1),
  description: z.string().optional(),
});

export const updateTaskSchema = z
  .strictObject({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one editable field is required",
  });

export const taskIdSchema = z.strictObject({
  id: z.uuid(),
});
