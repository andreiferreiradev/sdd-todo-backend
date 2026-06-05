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

test("lists an empty collection and then every created task", () => {
  const { dependencies } = createTestContext([TASK_ID, SECOND_TASK_ID]);
  assert.deepEqual(dependencies.listTasks.execute(), []);

  dependencies.createTask.execute({ title: "First" });
  dependencies.createTask.execute({ title: "Second" });

  assert.deepEqual(
    dependencies.listTasks.execute().map((task) => task.title),
    ["First", "Second"],
  );
});

test("filters and sorts tasks by priority", () => {
  const { dependencies } = createTestContext([
    TASK_ID,
    SECOND_TASK_ID,
    THIRD_TASK_ID,
  ]);

  dependencies.createTask.execute({ title: "Low", priority: 3 });
  dependencies.createTask.execute({ title: "High", priority: 1 });
  dependencies.createTask.execute({ title: "No priority" });

  assert.deepEqual(
    dependencies.listTasks.execute({ priority: 1 }).map((task) => task.title),
    ["High"],
  );
  assert.deepEqual(
    dependencies
      .listTasks.execute({ sortBy: "priority", sortOrder: "asc" })
      .map((task) => task.title),
    ["High", "Low", "No priority"],
  );
  assert.deepEqual(
    dependencies
      .listTasks.execute({ sortBy: "priority", sortOrder: "desc" })
      .map((task) => task.title),
    ["Low", "High", "No priority"],
  );
});

test("gets a task by id and reports a missing task", () => {
  const { dependencies } = createTestContext();
  const task = dependencies.createTask.execute({ title: "Find me" });

  assert.equal(dependencies.getTask.execute(TASK_ID), task);
  assert.throws(
    () => dependencies.getTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
