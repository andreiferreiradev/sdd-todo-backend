import { ApplicationError } from "../errors/application-error.js";

export type TaskStatus = "pending" | "completed";

export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskProps {
  id: string;
  title: string;
  description?: string;
  now: Date;
}

export interface UpdateTaskProps {
  title?: string | undefined;
  description?: string | null | undefined;
}

function normalizeTitle(title: string): string {
  const normalized = title.trim();
  if (!normalized) {
    throw new ApplicationError("VALIDATION_ERROR", "Task title is required");
  }
  return normalized;
}

export class Task {
  private constructor(private readonly props: TaskProps) {}

  static create(input: CreateTaskProps): Task {
    return new Task({
      id: input.id,
      title: normalizeTitle(input.title),
      ...(input.description === undefined
        ? {}
        : { description: input.description.trim() }),
      status: "pending",
      createdAt: input.now,
      updatedAt: input.now,
    });
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get status(): TaskStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(input: UpdateTaskProps, now: Date): void {
    if (input.title !== undefined) {
      this.props.title = normalizeTitle(input.title);
    }

    if (input.description !== undefined) {
      if (input.description === null) {
        delete this.props.description;
      } else {
        this.props.description = input.description.trim();
      }
    }

    this.props.updatedAt = now;
  }

  complete(now: Date): void {
    if (this.props.status === "completed") {
      return;
    }

    this.props.status = "completed";
    this.props.updatedAt = now;
  }

  toJSON(): TaskProps {
    return {
      id: this.props.id,
      title: this.props.title,
      ...(this.props.description === undefined
        ? {}
        : { description: this.props.description }),
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
