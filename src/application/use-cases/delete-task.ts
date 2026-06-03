import type { TaskRepository } from "../ports/task-repository.js";
import { ApplicationError } from "../../domain/errors/application-error.js";

export class DeleteTask {
  constructor(private readonly repository: TaskRepository) {}

  execute(id: string): void {
    if (!this.repository.findById(id)) {
      throw new ApplicationError("TASK_NOT_FOUND", "Task not found");
    }

    this.repository.delete(id);
  }
}
