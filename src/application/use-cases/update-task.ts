import type { Clock } from "../ports/clock.js";
import type { TaskRepository } from "../ports/task-repository.js";
import type { Task, UpdateTaskProps } from "../../domain/entities/task.js";
import { ApplicationError } from "../../domain/errors/application-error.js";

export class UpdateTask {
  constructor(
    private readonly repository: TaskRepository,
    private readonly clock: Clock,
  ) {}

  execute(id: string, input: UpdateTaskProps): Task {
    const task = this.repository.findById(id);
    if (!task) {
      throw new ApplicationError("TASK_NOT_FOUND", "Task not found");
    }

    task.update(input, this.clock.now());
    this.repository.save(task);
    return task;
  }
}
