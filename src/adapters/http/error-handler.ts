import type { FastifyInstance } from "fastify";
import { ApplicationError } from "../../domain/errors/application-error.js";

function statusFor(error: ApplicationError): number {
  switch (error.code) {
    case "VALIDATION_ERROR":
      return 400;
    case "TASK_NOT_FOUND":
      return 404;
    default:
      return 500;
  }
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApplicationError) {
      return reply.status(statusFor(error)).send({
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      });
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error &&
      error.statusCode === 400
    ) {
      return reply.status(400).send({
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    });
  });
}
