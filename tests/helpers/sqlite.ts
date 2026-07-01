import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Knex } from "knex";
import { KnexTaskRepository } from "../../src/adapters/persistence/knex-task-repository.js";
import { prepareDatabase } from "../../src/config/database.js";

export interface SqliteTestDatabase {
  filename: string;
  database: Knex;
  repository: KnexTaskRepository;
  cleanup(): Promise<void>;
}

export async function createSqliteTestDatabase(): Promise<SqliteTestDatabase> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sdd-todo-"));
  const filename = path.join(directory, "todos.sqlite");
  const database = await prepareDatabase({ sqliteFilename: filename });
  const repository = new KnexTaskRepository(database);

  return {
    filename,
    database,
    repository,
    async cleanup(): Promise<void> {
      await database.destroy();
      await rm(directory, { recursive: true, force: true });
    },
  };
}
