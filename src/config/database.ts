import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import knex, { type Knex } from "knex";
import { ApplicationError } from "../domain/errors/application-error.js";

export const DEFAULT_SQLITE_FILENAME = path.join(".data", "todos.sqlite");

export interface DatabaseConfig {
  sqliteFilename: string;
}

export function getDatabaseConfig(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  return {
    sqliteFilename: env.SQLITE_FILENAME ?? DEFAULT_SQLITE_FILENAME,
  };
}

function migrationsDirectory(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(
    path.dirname(currentFile),
    "../adapters/persistence/migrations",
  );
}

function migrationExtension(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.extname(currentFile).slice(1);
}

export function getKnexConfig(
  config: DatabaseConfig = getDatabaseConfig(),
): Knex.Config {
  return {
    client: "sqlite3",
    connection: {
      filename: config.sqliteFilename,
    },
    migrations: {
      directory: migrationsDirectory(),
      extension: migrationExtension(),
    },
    useNullAsDefault: true,
  };
}

async function ensureSqliteDirectory(filename: string): Promise<void> {
  if (filename === ":memory:" || filename.startsWith("file:")) {
    return;
  }

  const directory = path.dirname(filename);
  if (directory === ".") {
    return;
  }

  await mkdir(directory, { recursive: true });
}

export async function prepareDatabase(
  config: DatabaseConfig = getDatabaseConfig(),
): Promise<Knex> {
  await ensureSqliteDirectory(config.sqliteFilename);

  const database = knex(getKnexConfig(config));

  try {
    await database.migrate.latest();
    return database;
  } catch (error) {
    await database.destroy().catch(() => undefined);
    throw new ApplicationError(
      "INTERNAL_ERROR",
      "Failed to prepare local storage",
      error instanceof Error ? { cause: error.name } : undefined,
    );
  }
}
