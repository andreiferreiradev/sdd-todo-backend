import type { Task } from "../../domain/entities/task.js";

export interface TaskRepository {
  create(task: Task): Promise<void>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  save(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
}
