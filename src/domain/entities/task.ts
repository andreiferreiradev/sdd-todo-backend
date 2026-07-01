import { ApplicationError } from "../errors/application-error.js";

export type TaskStatus = "pending" | "completed";
export type TaskPriority = 1 | 2 | 3;

export interface TaskProps {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskProps {
  id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  now: Date;
}

export interface UpdateTaskProps {
  title?: string | undefined;
  description?: string | null | undefined;
  priority?: TaskPriority | undefined;
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

  static restore(input: TaskProps): Task {
    return new Task({
      id: input.id,
      title: input.title,
      ...(input.description === undefined
        ? {}
        : { description: input.description }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
      status: input.status,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });
  }

  static create(input: CreateTaskProps): Task {
    return new Task({
      id: input.id,
      title: normalizeTitle(input.title),
      ...(input.description === undefined
        ? {}
        : { description: input.description.trim() }),
      ...(input.priority === undefined ? {} : { priority: input.priority }),
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

  get priority(): TaskPriority | undefined {
    return this.props.priority;
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

    if (input.priority !== undefined) {
      this.props.priority = input.priority;
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
      ...(this.props.priority === undefined
        ? {}
        : { priority: this.props.priority }),
      status: this.props.status,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
