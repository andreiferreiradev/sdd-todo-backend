import { randomUUID } from "node:crypto";
import type { Knex } from "knex";
import { InMemoryTaskRepository } from "../adapters/persistence/in-memory-task-repository.js";
import { KnexTaskRepository } from "../adapters/persistence/knex-task-repository.js";
import type { TaskRouteDependencies } from "../adapters/http/routes/task-routes.js";
import type { Clock } from "../application/ports/clock.js";
import type { IdGenerator } from "../application/ports/id-generator.js";
import type { TaskRepository } from "../application/ports/task-repository.js";
import { CompleteTask } from "../application/use-cases/complete-task.js";
import { CreateTask } from "../application/use-cases/create-task.js";
import { DeleteTask } from "../application/use-cases/delete-task.js";
import { GetTask } from "../application/use-cases/get-task.js";
import { ListTasks } from "../application/use-cases/list-tasks.js";
import { UpdateTask } from "../application/use-cases/update-task.js";
import { prepareDatabase, type DatabaseConfig } from "./database.js";

export interface DependencyOverrides {
  repository?: TaskRepository;
  idGenerator?: IdGenerator;
  clock?: Clock;
}

export interface SqliteDependencyOptions {
  database?: Knex;
  databaseConfig?: DatabaseConfig;
  idGenerator?: IdGenerator;
  clock?: Clock;
}

export interface SqliteDependencies {
  database: Knex;
  dependencies: TaskRouteDependencies;
}

export function createDependencies(
  overrides: DependencyOverrides = {},
): TaskRouteDependencies {
  const repository = overrides.repository ?? new InMemoryTaskRepository();
  const idGenerator = overrides.idGenerator ?? { generate: randomUUID };
  const clock = overrides.clock ?? { now: () => new Date() };

  return {
    createTask: new CreateTask(repository, idGenerator, clock),
    listTasks: new ListTasks(repository),
    getTask: new GetTask(repository),
    updateTask: new UpdateTask(repository, clock),
    completeTask: new CompleteTask(repository, clock),
    deleteTask: new DeleteTask(repository),
  };
}

export async function createSqliteDependencies(
  options: SqliteDependencyOptions = {},
): Promise<SqliteDependencies> {
  const database =
    options.database ?? (await prepareDatabase(options.databaseConfig));
  const repository = new KnexTaskRepository(database);
  const overrides: DependencyOverrides = {
    repository,
    ...(options.idGenerator === undefined
      ? {}
      : { idGenerator: options.idGenerator }),
    ...(options.clock === undefined ? {} : { clock: options.clock }),
  };

  return {
    database,
    dependencies: createDependencies(overrides),
  };
}
