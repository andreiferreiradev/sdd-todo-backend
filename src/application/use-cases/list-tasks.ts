import type { TaskRepository } from "../ports/task-repository.js";
import type { Task, TaskPriority } from "../../domain/entities/task.js";

export interface ListTasksInput {
  priority?: TaskPriority | undefined;
  sortBy?: "priority" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
}

export class ListTasks {
  constructor(private readonly repository: TaskRepository) {}

  execute(input: ListTasksInput = {}): Task[] {
    let tasks = this.repository.findAll();

    if (input.priority !== undefined) {
      tasks = tasks.filter((task) => task.priority === input.priority);
    }

    if (input.sortBy === "priority") {
      const direction = input.sortOrder === "desc" ? -1 : 1;
      tasks = [...tasks].sort((left, right) => {
        if (left.priority === undefined && right.priority === undefined) {
          return 0;
        }
        if (left.priority === undefined) {
          return 1;
        }
        if (right.priority === undefined) {
          return -1;
        }
        return (left.priority - right.priority) * direction;
      });
    }

    return tasks;
  }
}
