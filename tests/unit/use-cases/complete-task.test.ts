import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("completes a task and keeps repeated completion idempotent", () => {
  const { dependencies, clock } = createTestContext();
  dependencies.createTask.execute({ title: "Complete me" });
  clock.set(new Date("2026-06-01T13:00:00.000Z"));

  const completed = dependencies.completeTask.execute(TASK_ID);
  clock.set(new Date("2026-06-01T14:00:00.000Z"));
  const repeated = dependencies.completeTask.execute(TASK_ID);

  assert.equal(completed.status, "completed");
  assert.equal(repeated.updatedAt.toISOString(), "2026-06-01T13:00:00.000Z");
});

test("reports a missing task during completion", () => {
  const { dependencies } = createTestContext();
  assert.throws(
    () => dependencies.completeTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
