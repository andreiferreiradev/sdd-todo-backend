import type { TaskRepository } from "../ports/task-repository.js";
import type { Task } from "../../domain/entities/task.js";
import { ApplicationError } from "../../domain/errors/application-error.js";

export class GetTask {
  constructor(private readonly repository: TaskRepository) {}

  execute(id: string): Task {
    const task = this.repository.findById(id);
    if (!task) {
      throw new ApplicationError("TASK_NOT_FOUND", "Task not found");
    }
    return task;
  }
}
