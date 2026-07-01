import type { Knex } from "knex";
import type { TaskRepository } from "../../application/ports/task-repository.js";
import { Task, type TaskPriority, type TaskStatus } from "../../domain/entities/task.js";
import { ApplicationError } from "../../domain/errors/application-error.js";

export const TASKS_TABLE = "tasks";

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  priority: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

function toTaskPriority(value: number | null): TaskPriority | undefined {
  if (value === null) {
    return undefined;
  }

  if (value === 1 || value === 2 || value === 3) {
    return value;
  }

  throw new Error("Invalid task priority stored in database");
}

function toTaskStatus(value: string): TaskStatus {
  if (value === "pending" || value === "completed") {
    return value;
  }

  throw new Error("Invalid task status stored in database");
}

function toDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid task date stored in database");
  }
  return date;
}

export function taskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    priority: task.priority ?? null,
    status: task.status,
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
  };
}

export function rowToTask(row: TaskRow): Task {
  const description = row.description ?? undefined;
  const priority = toTaskPriority(row.priority);

  return Task.restore({
    id: row.id,
    title: row.title,
    ...(description === undefined ? {} : { description }),
    ...(priority === undefined ? {} : { priority }),
    status: toTaskStatus(row.status),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  });
}

export function toPersistenceError(error: unknown): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }

  return new ApplicationError(
    "INTERNAL_ERROR",
    "Persistence operation failed",
    error instanceof Error ? { cause: error.name } : undefined,
  );
}

export async function withPersistenceErrorHandling<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw toPersistenceError(error);
  }
}

export class KnexTaskRepository implements TaskRepository {
  constructor(private readonly database: Knex) {}

  async create(task: Task): Promise<void> {
    await withPersistenceErrorHandling(async () => {
      await this.database<TaskRow>(TASKS_TABLE).insert(taskToRow(task));
    });
  }

  async findAll(): Promise<Task[]> {
    return withPersistenceErrorHandling(async () => {
      const rows = await this.database<TaskRow>(TASKS_TABLE)
        .select("*")
        .orderBy("created_at", "asc")
        .orderBy("id", "asc");
      return rows.map(rowToTask);
    });
  }

  async findById(id: string): Promise<Task | undefined> {
    return withPersistenceErrorHandling(async () => {
      const row = await this.database<TaskRow>(TASKS_TABLE)
        .where({ id })
        .first();
      return row === undefined ? undefined : rowToTask(row);
    });
  }

  async save(task: Task): Promise<void> {
    await withPersistenceErrorHandling(async () => {
      await this.database<TaskRow>(TASKS_TABLE)
        .where({ id: task.id })
        .update(taskToRow(task));
    });
  }

  async delete(id: string): Promise<void> {
    await withPersistenceErrorHandling(async () => {
      await this.database<TaskRow>(TASKS_TABLE).where({ id }).delete();
    });
  }
}
