import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("deletes pending and completed tasks", async () => {
  const { dependencies, repository } = createTestContext();
  await dependencies.createTask.execute({ title: "Delete me" });
  await dependencies.completeTask.execute(TASK_ID);

  await dependencies.deleteTask.execute(TASK_ID);

  assert.equal(await repository.findById(TASK_ID), undefined);
});

test("reports a missing task during deletion", async () => {
  const { dependencies } = createTestContext();
  await assert.rejects(
    dependencies.deleteTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
