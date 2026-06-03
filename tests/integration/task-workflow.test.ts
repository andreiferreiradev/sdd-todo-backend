import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "../../src/app.js";
import { TASK_ID, createTestContext } from "../helpers/fakes.js";

test("runs the full task workflow", async () => {
  const context = createTestContext();
  const app = buildApp(context.dependencies);

  const created = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "Write tests", description: "Cover the workflow" },
  });
  assert.equal(created.statusCode, 201);
  assert.equal(created.json().id, TASK_ID);

  assert.equal((await app.inject({ method: "GET", url: "/tasks" })).json().length, 1);
  assert.equal(
    (await app.inject({ method: "GET", url: `/tasks/${TASK_ID}` })).json().title,
    "Write tests",
  );

  const updated = await app.inject({
    method: "PATCH",
    url: `/tasks/${TASK_ID}`,
    payload: { title: "Run tests" },
  });
  assert.equal(updated.json().title, "Run tests");

  const completed = await app.inject({
    method: "PATCH",
    url: `/tasks/${TASK_ID}/complete`,
  });
  assert.equal(completed.json().status, "completed");

  assert.equal(
    (await app.inject({ method: "DELETE", url: `/tasks/${TASK_ID}` })).statusCode,
    204,
  );
  assert.deepEqual((await app.inject({ method: "GET", url: "/tasks" })).json(), []);
  assert.equal(
    (await app.inject({ method: "GET", url: `/tasks/${TASK_ID}` })).statusCode,
    404,
  );

  await app.close();
});

test("default dependencies generate UUID v4 identifiers", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/tasks",
    payload: { title: "Generated ID" },
  });

  assert.equal(response.statusCode, 201);
  assert.match(
    response.json().id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
  await app.close();
});
