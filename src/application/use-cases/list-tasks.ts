import type { TaskRepository } from "../ports/task-repository.js";
import type { Task } from "../../domain/entities/task.js";

export class ListTasks {
  constructor(private readonly repository: TaskRepository) {}

  execute(): Task[] {
    return this.repository.findAll();
  }
}
