import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "../../src/app.js";
import { createSqliteDependencies } from "../../src/config/dependencies.js";
import { TASK_ID } from "../helpers/fakes.js";
import { createSqliteTestDatabase } from "../helpers/sqlite.js";

test("persists created, updated, and completed tasks after app restart", async () => {
  const sqlite = await createSqliteTestDatabase();

  try {
    const firstRuntime = await createSqliteDependencies({
      database: sqlite.database,
      idGenerator: { generate: () => TASK_ID },
      clock: { now: () => new Date("2026-06-16T10:00:00.000Z") },
    });
    const firstApp = buildApp(firstRuntime.dependencies);

    const created = await firstApp.inject({
      method: "POST",
      url: "/tasks",
      payload: { title: "Persist workflow", description: "Before restart" },
    });
    assert.equal(created.statusCode, 201);

    const updated = await firstApp.inject({
      method: "PATCH",
      url: `/tasks/${TASK_ID}`,
      payload: { title: "Persisted workflow", priority: 1 },
    });
    assert.equal(updated.statusCode, 200);

    const completed = await firstApp.inject({
      method: "PATCH",
      url: `/tasks/${TASK_ID}/complete`,
    });
    assert.equal(completed.statusCode, 200);

    await firstApp.close();
    await sqlite.database.destroy();

    const secondRuntime = await createSqliteDependencies({
      databaseConfig: { sqliteFilename: sqlite.filename },
    });
    const secondApp = buildApp(secondRuntime.dependencies);

    try {
      const listed = await secondApp.inject({ method: "GET", url: "/tasks" });
      assert.equal(listed.statusCode, 200);
      assert.equal(listed.json().length, 1);
      assert.equal(listed.json()[0].id, TASK_ID);

      const fetched = await secondApp.inject({
        method: "GET",
        url: `/tasks/${TASK_ID}`,
      });
      assert.equal(fetched.statusCode, 200);
      assert.equal(fetched.json().title, "Persisted workflow");
      assert.equal(fetched.json().description, "Before restart");
      assert.equal(fetched.json().priority, 1);
      assert.equal(fetched.json().status, "completed");

      const deleted = await secondApp.inject({
        method: "DELETE",
        url: `/tasks/${TASK_ID}`,
      });
      assert.equal(deleted.statusCode, 204);
    } finally {
      await secondApp.close();
      await secondRuntime.database.destroy();
    }

    const thirdRuntime = await createSqliteDependencies({
      databaseConfig: { sqliteFilename: sqlite.filename },
    });
    const thirdApp = buildApp(thirdRuntime.dependencies);

    try {
      const listed = await thirdApp.inject({ method: "GET", url: "/tasks" });
      assert.equal(listed.statusCode, 200);
      assert.deepEqual(listed.json(), []);

      const fetched = await thirdApp.inject({
        method: "GET",
        url: `/tasks/${TASK_ID}`,
      });
      assert.equal(fetched.statusCode, 404);
    } finally {
      await thirdApp.close();
      await thirdRuntime.database.destroy();
    }
  } finally {
    await sqlite.cleanup();
  }
});
