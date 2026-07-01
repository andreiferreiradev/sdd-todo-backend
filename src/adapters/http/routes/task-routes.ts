import type { FastifyInstance } from "fastify";
import type { ZodType } from "zod";
import type { CompleteTask } from "../../../application/use-cases/complete-task.js";
import type { CreateTask } from "../../../application/use-cases/create-task.js";
import type { DeleteTask } from "../../../application/use-cases/delete-task.js";
import type { GetTask } from "../../../application/use-cases/get-task.js";
import type { ListTasks } from "../../../application/use-cases/list-tasks.js";
import type { UpdateTask } from "../../../application/use-cases/update-task.js";
import { ApplicationError } from "../../../domain/errors/application-error.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdSchema,
  updateTaskSchema,
} from "../schemas/task-schemas.js";

export interface TaskRouteDependencies {
  createTask: CreateTask;
  listTasks: ListTasks;
  getTask: GetTask;
  updateTask: UpdateTask;
  completeTask: CompleteTask;
  deleteTask: DeleteTask;
}

function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ApplicationError(
      "VALIDATION_ERROR",
      "Invalid request data",
      result.error.issues,
    );
  }
  return result.data;
}

export function registerTaskRoutes(
  app: FastifyInstance,
  dependencies: TaskRouteDependencies,
): void {
  app.post("/tasks", async (request, reply) => {
    const input = parse(createTaskSchema, request.body);
    const task = await dependencies.createTask.execute(input);
    return reply.status(201).send(task);
  });

  app.get("/tasks", async (request) => {
    const query = parse(listTasksQuerySchema, request.query);
    return dependencies.listTasks.execute(query);
  });

  app.get("/tasks/:id", async (request) => {
    const { id } = parse(taskIdSchema, request.params);
    return dependencies.getTask.execute(id);
  });

  app.patch("/tasks/:id", async (request) => {
    const { id } = parse(taskIdSchema, request.params);
    const input = parse(updateTaskSchema, request.body);
    return dependencies.updateTask.execute(id, input);
  });

  app.patch("/tasks/:id/complete", async (request) => {
    const { id } = parse(taskIdSchema, request.params);
    return dependencies.completeTask.execute(id);
  });

  app.delete("/tasks/:id", async (request, reply) => {
    const { id } = parse(taskIdSchema, request.params);
    await dependencies.deleteTask.execute(id);
    return reply.status(204).send();
  });
}
