import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("completes a task and keeps repeated completion idempotent", async () => {
  const { dependencies, clock } = createTestContext();
  await dependencies.createTask.execute({ title: "Complete me" });
  clock.set(new Date("2026-06-01T13:00:00.000Z"));

  const completed = await dependencies.completeTask.execute(TASK_ID);
  clock.set(new Date("2026-06-01T14:00:00.000Z"));
  const repeated = await dependencies.completeTask.execute(TASK_ID);

  assert.equal(completed.status, "completed");
  assert.equal(repeated.updatedAt.toISOString(), "2026-06-01T13:00:00.000Z");
});

test("reports a missing task during completion", async () => {
  const { dependencies } = createTestContext();
  await assert.rejects(
    dependencies.completeTask.execute(MISSING_TASK_ID),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
