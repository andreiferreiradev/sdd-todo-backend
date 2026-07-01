import Fastify, { type FastifyInstance } from "fastify";
import { registerErrorHandler } from "./adapters/http/error-handler.js";
import {
  registerTaskRoutes,
  type TaskRouteDependencies,
} from "./adapters/http/routes/task-routes.js";
import { createDependencies } from "./config/dependencies.js";

import cors from "@fastify/cors";

export function buildApp(dependencies?: TaskRouteDependencies): FastifyInstance {
  const routeDependencies = dependencies ?? createDependencies();
  const app = Fastify();

  app.register(cors, {
    origin: "*",
  })
  registerErrorHandler(app);
  registerTaskRoutes(app, routeDependencies);
  return app;
}
