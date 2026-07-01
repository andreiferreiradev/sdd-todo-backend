import assert from "node:assert/strict";
import { test } from "node:test";
import { KnexTaskRepository } from "../../src/adapters/persistence/knex-task-repository.js";
import { ListTasks } from "../../src/application/use-cases/list-tasks.js";
import { prepareDatabase } from "../../src/config/database.js";
import { Task } from "../../src/domain/entities/task.js";
import { SECOND_TASK_ID, TASK_ID, THIRD_TASK_ID } from "../helpers/fakes.js";
import { createSqliteTestDatabase } from "../helpers/sqlite.js";

test("persists created tasks across reopened SQLite connections", async () => {
  const context = await createSqliteTestDatabase();

  try {
    const task = Task.create({
      id: TASK_ID,
      title: "Persist me",
      description: "Stored locally",
      priority: 2,
      now: new Date("2026-06-16T10:00:00.000Z"),
    });

    await context.repository.create(task);
    assert.equal((await context.repository.findAll()).length, 1);

    await context.database.destroy();
    const reopenedDatabase = await prepareDatabase({
      sqliteFilename: context.filename,
    });
    const reopenedRepository = new KnexTaskRepository(reopenedDatabase);

    try {
      const persisted = await reopenedRepository.findById(TASK_ID);
      assert.ok(persisted);
      assert.equal(persisted.title, "Persist me");
      assert.equal(persisted.description, "Stored locally");
      assert.equal(persisted.priority, 2);
      assert.equal(persisted.status, "pending");
      assert.equal(
        persisted.createdAt.toISOString(),
        "2026-06-16T10:00:00.000Z",
      );
      assert.deepEqual(
        (await reopenedRepository.findAll()).map((storedTask) => storedTask.id),
        [TASK_ID],
      );
    } finally {
      await reopenedDatabase.destroy();
    }
  } finally {
    await context.cleanup();
  }
});

test("supports filtering and priority sorting through public use-case behavior", async () => {
  const context = await createSqliteTestDatabase();

  try {
    await context.repository.create(
      Task.create({
        id: TASK_ID,
        title: "Low",
        priority: 3,
        now: new Date("2026-06-16T10:00:00.000Z"),
      }),
    );
    await context.repository.create(
      Task.create({
        id: SECOND_TASK_ID,
        title: "High",
        priority: 1,
        now: new Date("2026-06-16T10:01:00.000Z"),
      }),
    );
    await context.repository.create(
      Task.create({
        id: THIRD_TASK_ID,
        title: "No priority",
        now: new Date("2026-06-16T10:02:00.000Z"),
      }),
    );

    const listTasks = new ListTasks(context.repository);

    assert.deepEqual(
      (await listTasks.execute({ priority: 1 })).map((task) => task.title),
      ["High"],
    );
    assert.deepEqual(
      (
        await listTasks.execute({
          sortBy: "priority",
          sortOrder: "asc",
        })
      ).map((task) => task.title),
      ["High", "Low", "No priority"],
    );
    assert.deepEqual(
      (
        await listTasks.execute({
          sortBy: "priority",
          sortOrder: "desc",
        })
      ).map((task) => task.title),
      ["Low", "High", "No priority"],
    );
  } finally {
    await context.cleanup();
  }
});
