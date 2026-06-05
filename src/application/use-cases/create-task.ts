import type { Clock } from "../ports/clock.js";
import type { IdGenerator } from "../ports/id-generator.js";
import type { TaskRepository } from "../ports/task-repository.js";
import { Task, type TaskPriority } from "../../domain/entities/task.js";

export interface CreateTaskInput {
  title: string;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
}

export class CreateTask {
  constructor(
    private readonly repository: TaskRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock,
  ) {}

  execute(input: CreateTaskInput): Task {
    const task = Task.create({
      id: this.idGenerator.generate(),
      title: input.title,
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      now: this.clock.now(),
    });

    this.repository.create(task);
    return task;
  }
}
