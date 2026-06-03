import { InMemoryTaskRepository } from "../../src/adapters/persistence/in-memory-task-repository.js";
import type { Clock } from "../../src/application/ports/clock.js";
import type { IdGenerator } from "../../src/application/ports/id-generator.js";
import { CompleteTask } from "../../src/application/use-cases/complete-task.js";
import { CreateTask } from "../../src/application/use-cases/create-task.js";
import { DeleteTask } from "../../src/application/use-cases/delete-task.js";
import { GetTask } from "../../src/application/use-cases/get-task.js";
import { ListTasks } from "../../src/application/use-cases/list-tasks.js";
import { UpdateTask } from "../../src/application/use-cases/update-task.js";

export const TASK_ID = "123e4567-e89b-42d3-a456-426614174000";
export const SECOND_TASK_ID = "223e4567-e89b-42d3-a456-426614174000";
export const MISSING_TASK_ID = "323e4567-e89b-42d3-a456-426614174000";

export class FixedIdGenerator implements IdGenerator {
  constructor(private readonly ids: string[] = [TASK_ID]) {}

  generate(): string {
    const id = this.ids.shift();
    if (!id) {
      throw new Error("No fake IDs available");
    }
    return id;
  }
}

export class MutableClock implements Clock {
  constructor(private value = new Date("2026-06-01T12:00:00.000Z")) {}

  now(): Date {
    return new Date(this.value);
  }

  set(value: Date): void {
    this.value = value;
  }
}

export function createTestContext(ids: string[] = [TASK_ID]) {
  const repository = new InMemoryTaskRepository();
  const idGenerator = new FixedIdGenerator(ids);
  const clock = new MutableClock();

  return {
    repository,
    idGenerator,
    clock,
    dependencies: {
      createTask: new CreateTask(repository, idGenerator, clock),
      listTasks: new ListTasks(repository),
      getTask: new GetTask(repository),
      updateTask: new UpdateTask(repository, clock),
      completeTask: new CompleteTask(repository, clock),
      deleteTask: new DeleteTask(repository),
    },
  };
}
