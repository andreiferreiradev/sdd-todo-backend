import assert from "node:assert/strict";
import { test } from "node:test";
import { ApplicationError } from "../../../src/domain/errors/application-error.js";
import { TASK_ID, createTestContext } from "../../helpers/fakes.js";

test("creates a task with generated UUID, pending status, and timestamps", () => {
  const { dependencies, repository } = createTestContext();
  const task = dependencies.createTask.execute({
    title: "  Learn TypeScript  ",
    description: "  Use strict mode  ",
    priority: 2,
  });

  assert.equal(task.id, TASK_ID);
  assert.equal(task.title, "Learn TypeScript");
  assert.equal(task.description, "Use strict mode");
  assert.equal(task.priority, 2);
  assert.equal(task.status, "pending");
  assert.equal(task.createdAt.toISOString(), "2026-06-01T12:00:00.000Z");
  assert.equal(task.updatedAt, task.createdAt);
  assert.equal(repository.findById(TASK_ID), task);
});

test("rejects invalid title without persisting a task", () => {
  const { dependencies, repository } = createTestContext();

  assert.throws(
    () => dependencies.createTask.execute({ title: " " }),
    (error) =>
      error instanceof ApplicationError && error.code === "VALIDATION_ERROR",
  );
  assert.deepEqual(repository.findAll(), []);
});
