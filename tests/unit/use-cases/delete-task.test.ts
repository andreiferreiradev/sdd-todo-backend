import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("deletes pending and completed tasks", () => {
  const { dependencies, repository } = createTestContext();
  dependencies.createTask.execute({ title: "Delete me" });
  dependencies.completeTask.execute(TASK_ID);

  dependencies.deleteTask.execute(TASK_ID);

  assert.equal(repository.findById(TASK_ID), undefined);
});

test("reports a missing task during deletion", () => {
  const { dependencies } = createTestContext();
  assert.throws(
    () => dependencies.deleteTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
