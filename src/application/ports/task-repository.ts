import type { Task } from "../../domain/entities/task.js";

export interface TaskRepository {
  create(task: Task): void;
  findAll(): Task[];
  findById(id: string): Task | undefined;
  save(task: Task): void;
  delete(id: string): void;
}
