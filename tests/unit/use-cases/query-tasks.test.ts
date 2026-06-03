import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  SECOND_TASK_ID,
  TASK_ID,
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
