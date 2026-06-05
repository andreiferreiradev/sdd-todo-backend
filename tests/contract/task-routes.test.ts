import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "../../src/app.js";
import {
  MISSING_TASK_ID,
  SECOND_TASK_ID,
  TASK_ID,
  THIRD_TASK_ID,
  createTestContext,
} from "../helpers/fakes.js";

test("POST /tasks creates tasks and rejects invalid bodies", async () => {
  const context = createTestContext([TASK_ID, SECOND_TASK_ID]);
  const app = buildApp(context.dependencies);
  const created = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "  Study  ", description: "  Plan  ", priority: 2 },
  });

  assert.equal(created.statusCode, 201);
  assert.deepEqual(created.json(), {
    id: TASK_ID,
    title: "Study",
    description: "Plan",
    priority: 2,
    status: "pending",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-01T12:00:00.000Z",
  });

  for (const payload of [
    {},
    { title: " " },
    { title: "Task", priority: 4 },
    { title: "Task", extra: true },
  ]) {
    const response = await app.inject({ method: "POST", url: "/tasks", payload });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().code, "VALIDATION_ERROR");
  }
  await app.close();
});

test("GET /tasks and GET /tasks/:id query tasks and validate ids", async () => {
  const context = createTestContext();
  const app = buildApp(context.dependencies);
  assert.deepEqual((await app.inject({ method: "GET", url: "/tasks" })).json(), []);
  await app.inject({ method: "POST", url: "/tasks", payload: { title: "Query" } });

  assert.equal((await app.inject({ method: "GET", url: "/tasks" })).json().length, 1);
  assert.equal(
    (await app.inject({ method: "GET", url: `/tasks/${TASK_ID}` })).json().title,
    "Query",
  );
  assert.equal(
    (await app.inject({ method: "GET", url: "/tasks/not-a-uuid" })).statusCode,
    400,
  );
  assert.equal(
    (await app.inject({ method: "GET", url: `/tasks/${MISSING_TASK_ID}` })).statusCode,
    404,
  );
  await app.close();
});

test("GET /tasks filters and sorts by priority", async () => {
  const context = createTestContext([TASK_ID, SECOND_TASK_ID, THIRD_TASK_ID]);
  const app = buildApp(context.dependencies);
  await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "Low", priority: 3 },
  });
  await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "High", priority: 1 },
  });
  await app.inject({ method: "POST", url: "/tasks", payload: { title: "None" } });

  assert.deepEqual(
    (await app.inject({ method: "GET", url: "/tasks?priority=1" }))
      .json()
      .map((task: { title: string }) => task.title),
    ["High"],
  );
  assert.deepEqual(
    (await app.inject({ method: "GET", url: "/tasks?sortBy=priority&sortOrder=asc" }))
      .json()
      .map((task: { title: string }) => task.title),
    ["High", "Low", "None"],
  );
  assert.equal(
    (await app.inject({ method: "GET", url: "/tasks?priority=4" })).statusCode,
    400,
  );
  await app.close();
});

test("PATCH /tasks/:id updates fields and rejects invalid input", async () => {
  const context = createTestContext();
  const app = buildApp(context.dependencies);
  await app.inject({ method: "POST", url: "/tasks", payload: { title: "Initial" } });
  context.clock.set(new Date("2026-06-01T13:00:00.000Z"));

  const updated = await app.inject({
    method: "PATCH",
    url: `/tasks/${TASK_ID}`,
    payload: { title: " Updated ", description: null, priority: 1 },
  });
  assert.equal(updated.statusCode, 200);
  assert.equal(updated.json().title, "Updated");
  assert.equal(updated.json().description, undefined);
  assert.equal(updated.json().priority, 1);
  assert.equal(updated.json().updatedAt, "2026-06-01T13:00:00.000Z");

  for (const payload of [
    {},
    { title: " " },
    { priority: 0 },
    { title: "Valid", extra: true },
  ]) {
    const response = await app.inject({
      method: "PATCH",
      url: `/tasks/${TASK_ID}`,
      payload,
    });
    assert.equal(response.statusCode, 400);
  }
  assert.equal(
    (await app.inject({ method: "PATCH", url: "/tasks/nope", payload: { title: "X" } }))
      .statusCode,
    400,
  );
  assert.equal(
    (
      await app.inject({
        method: "PATCH",
        url: `/tasks/${MISSING_TASK_ID}`,
        payload: { title: "X" },
      })
    ).statusCode,
    404,
  );
  await app.close();
});

test("PATCH /tasks/:id/complete is idempotent", async () => {
  const context = createTestContext();
  const app = buildApp(context.dependencies);
  await app.inject({ method: "POST", url: "/tasks", payload: { title: "Complete" } });
  context.clock.set(new Date("2026-06-01T13:00:00.000Z"));

  const completed = await app.inject({
    method: "PATCH",
    url: `/tasks/${TASK_ID}/complete`,
  });
  context.clock.set(new Date("2026-06-01T14:00:00.000Z"));
  const repeated = await app.inject({
    method: "PATCH",
    url: `/tasks/${TASK_ID}/complete`,
  });

  assert.equal(completed.json().status, "completed");
  assert.equal(repeated.json().updatedAt, "2026-06-01T13:00:00.000Z");
  assert.equal(
    (await app.inject({ method: "PATCH", url: "/tasks/nope/complete" })).statusCode,
    400,
  );
  assert.equal(
    (await app.inject({ method: "PATCH", url: `/tasks/${MISSING_TASK_ID}/complete` }))
      .statusCode,
    404,
  );
  await app.close();
});

test("DELETE /tasks/:id removes tasks and validates ids", async () => {
  const context = createTestContext();
  const app = buildApp(context.dependencies);
  await app.inject({ method: "POST", url: "/tasks", payload: { title: "Delete" } });

  assert.equal(
    (await app.inject({ method: "DELETE", url: `/tasks/${TASK_ID}` })).statusCode,
    204,
  );
  assert.deepEqual((await app.inject({ method: "GET", url: "/tasks" })).json(), []);
  assert.equal(
    (await app.inject({ method: "DELETE", url: "/tasks/nope" })).statusCode,
    400,
  );
  assert.equal(
    (await app.inject({ method: "DELETE", url: `/tasks/${MISSING_TASK_ID}` })).statusCode,
    404,
  );
  await app.close();
});
