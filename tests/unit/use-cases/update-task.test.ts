import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import {
  MISSING_TASK_ID,
  TASK_ID,
  createTestContext,
} from "../../helpers/fakes.js";

test("updates editable fields, removes description, and renews timestamp", async () => {
  const { dependencies, clock } = createTestContext();
  await dependencies.createTask.execute({ title: "Initial", description: "Remove" });
  clock.set(new Date("2026-06-01T13:00:00.000Z"));

  const task = await dependencies.updateTask.execute(TASK_ID, {
    title: " Updated ",
    description: null,
    priority: 1,
  });

  assert.equal(task.title, "Updated");
  assert.equal(task.description, undefined);
  assert.equal(task.priority, 1);
  assert.equal(task.status, "pending");
  assert.equal(task.updatedAt.toISOString(), "2026-06-01T13:00:00.000Z");
});

test("reports a missing task during update", async () => {
  const { dependencies } = createTestContext();
  await assert.rejects(
    dependencies.updateTask.execute(MISSING_TASK_ID, { title: "Nope" }),
    (error) =>
      error instanceof ApplicationError && error.code === "TASK_NOT_FOUND",
  );
});
