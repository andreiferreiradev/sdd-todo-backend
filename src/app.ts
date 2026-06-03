import Fastify, { type FastifyInstance } from "fastify";
import { registerErrorHandler } from "./adapters/http/error-handler.js";
import {
  registerTaskRoutes,
  type TaskRouteDependencies,
} from "./adapters/http/routes/task-routes.js";
import { createDependencies } from "./config/dependencies.js";

export function buildApp(
  dependencies: TaskRouteDependencies = createDependencies(),
): FastifyInstance {
  const app = Fastify();
  registerErrorHandler(app);
  registerTaskRoutes(app, dependencies);
  return app;
}
