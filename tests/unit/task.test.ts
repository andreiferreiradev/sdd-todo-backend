import assert from "node:assert/strict";
import { test } from "node:test";
import { Task } from "../../src/domain/entities/task.js";
import { ApplicationError } from "../../src/domain/errors/application-error.js";
import { TASK_ID } from "../helpers/fakes.js";

const createdAt = new Date("2026-06-01T12:00:00.000Z");
const updatedAt = new Date("2026-06-01T13:00:00.000Z");

test("creates a trimmed pending task with matching timestamps", () => {
  const task = Task.create({
    id: TASK_ID,
    title: "  Study hexagonal architecture  ",
    description: "  Read the plan  ",
    now: createdAt,
  });

  assert.equal(task.title, "Study hexagonal architecture");
  assert.equal(task.description, "Read the plan");
  assert.equal(task.status, "pending");
  assert.equal(task.createdAt, createdAt);
  assert.equal(task.updatedAt, createdAt);
});

test("rejects blank titles", () => {
  assert.throws(
    () => Task.create({ id: TASK_ID, title: "   ", now: createdAt }),
    (error) =>
      error instanceof ApplicationError &&
      error.code === "VALIDATION_ERROR" &&
      error.message === "Task title is required",
  );
});

test("updates editable fields and removes description", () => {
  const task = Task.create({
    id: TASK_ID,
    title: "Initial",
    description: "Description",
    now: createdAt,
  });

  task.update({ title: "  Updated  ", description: null }, updatedAt);

  assert.equal(task.title, "Updated");
  assert.equal(task.description, undefined);
  assert.equal(task.updatedAt, updatedAt);
});

test("completion is idempotent and only changes timestamp once", () => {
  const task = Task.create({ id: TASK_ID, title: "Task", now: createdAt });
  task.complete(updatedAt);
  task.complete(new Date("2026-06-01T14:00:00.000Z"));

  assert.equal(task.status, "completed");
  assert.equal(task.updatedAt, updatedAt);
});
