export type ApplicationErrorCode =
  | "VALIDATION_ERROR"
  | "TASK_NOT_FOUND"
  | "INTERNAL_ERROR";

export class ApplicationError extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApplicationError";
  }
}
