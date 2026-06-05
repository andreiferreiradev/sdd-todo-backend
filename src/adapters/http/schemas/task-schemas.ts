import { z } from "zod";

const taskPrioritySchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

export const createTaskSchema = z.strictObject({
  title: z.string().trim().min(1),
  description: z.string().optional(),
  priority: taskPrioritySchema.optional(),
});

export const updateTaskSchema = z
  .strictObject({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    priority: taskPrioritySchema.optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one editable field is required",
  });

export const listTasksQuerySchema = z.strictObject({
  priority: z.coerce.number().pipe(taskPrioritySchema).optional(),
  sortBy: z.literal("priority").optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const taskIdSchema = z.strictObject({
  id: z.uuid(),
});
