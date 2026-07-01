import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  SECOND_TASK_ID,
  TASK_ID,
  THIRD_TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("lists an empty collection and then every created task", async () => {
  const { dependencies } = createTestContext([TASK_ID, SECOND_TASK_ID]);
  assert.deepEqual(await dependencies.listTasks.execute(), []);

  await dependencies.createTask.execute({ title: "First" });
  await dependencies.createTask.execute({ title: "Second" });

  assert.deepEqual(
    (await dependencies.listTasks.execute()).map((task) => task.title),
    ["First", "Second"],
  );
});

test("filters and sorts tasks by priority", async () => {
  const { dependencies } = createTestContext([
    TASK_ID,
    SECOND_TASK_ID,
    THIRD_TASK_ID,
  ]);

  await dependencies.createTask.execute({ title: "Low", priority: 3 });
  await dependencies.createTask.execute({ title: "High", priority: 1 });
  await dependencies.createTask.execute({ title: "No priority" });

  assert.deepEqual(
    (await dependencies.listTasks.execute({ priority: 1 })).map((task) => task.title),
    ["High"],
  );
  assert.deepEqual(
    (
      await dependencies.listTasks.execute({
        sortBy: "priority",
        sortOrder: "asc",
      })
    ).map((task) => task.title),
    ["High", "Low", "No priority"],
  );
  assert.deepEqual(
    (
      await dependencies.listTasks.execute({
        sortBy: "priority",
        sortOrder: "desc",
      })
    ).map((task) => task.title),
    ["Low", "High", "No priority"],
  );
});

test("gets a task by id and reports a missing task", async () => {
  const { dependencies } = createTestContext();
  const task = await dependencies.createTask.execute({ title: "Find me" });

  assert.equal(await dependencies.getTask.execute(TASK_ID), task);
  await assert.rejects(
    dependencies.getTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
