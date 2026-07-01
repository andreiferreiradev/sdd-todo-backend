import assert from "node:assert/strict";
import { access, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { buildApp } from "../../src/app.js";
import { createSqliteDependencies } from "../../src/config/dependencies.js";

test("creates a missing SQLite file and serves an empty task list after migrations", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "sdd-todo-startup-"));
  const filename = path.join(directory, "missing.sqlite");

  try {
    await assert.rejects(access(filename));

    const { database, dependencies } = await createSqliteDependencies({
      databaseConfig: { sqliteFilename: filename },
    });
    const app = buildApp(dependencies);

    try {
      await access(filename);

      const response = await app.inject({ method: "GET", url: "/tasks" });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), []);
    } finally {
      await app.close();
      await database.destroy();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
