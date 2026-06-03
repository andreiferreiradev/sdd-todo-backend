import type { TaskRepository } from "../../application/ports/task-repository.js";
import type { Task } from "../../domain/entities/task.js";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  create(task: Task): void {
    this.tasks.set(task.id, task);
  }

  findAll(): Task[] {
    return [...this.tasks.values()];
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  save(task: Task): void {
    this.tasks.set(task.id, task);
  }

  delete(id: string): void {
    this.tasks.delete(id);
  }
}
