import type { TaskRepository } from "../../application/ports/task-repository.js";
import type { Task } from "../../domain/entities/task.js";

export class InMemoryTaskRepository implements TaskRepository {
  private readonly tasks = new Map<string, Task>();

  async create(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async findAll(): Promise<Task[]> {
    return [...this.tasks.values()];
  }

  async findById(id: string): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async save(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}
