# Research: Persistencia Local SQLite de Tarefas

## Decision: Use Knex with sqlite3

**Rationale**: The feature explicitly requests Knex and local SQLite. The `sqlite3`
driver is a common Knex SQLite integration and fits the local study/development scope
without changing the existing HTTP or application contracts.

**Alternatives considered**: `better-sqlite3` was considered for simple local SQLite
access, but `sqlite3` was selected as the default driver for Knex compatibility and
broader familiarity.

## Decision: Configure database file with SQLITE_FILENAME plus fallback

**Rationale**: An environment variable lets tests and local runs point to isolated files.
A fallback keeps development simple when no variable is provided and satisfies the local
single-instance scope.

**Alternatives considered**: A fixed path would make tests harder to isolate. Requiring an
environment variable for every run would add avoidable setup friction for this study
project.

## Decision: Run migrations before serving HTTP

**Rationale**: The specification requires the application to support a missing SQLite
file while ensuring the schema exists before any request is served. Running Knex
migrations during startup before `app.listen()` creates/prepares the file and prevents
controllers from seeing an incomplete schema.

**Alternatives considered**: Lazy schema creation on the first request would violate the
startup requirement and mix persistence preparation with request handling.

## Decision: Keep TaskRepository as the persistence boundary

**Rationale**: Existing use cases already depend on `TaskRepository`, which is the correct
hexagonal boundary. A Knex-backed implementation can replace the in-memory adapter without
changing controllers, use cases or domain entities.

**Alternatives considered**: Injecting Knex directly into use cases or controllers would
be simpler mechanically, but it violates the constitution and the feature requirements.

## Decision: Preserve the existing OpenAPI contract unchanged

**Rationale**: The feature only changes storage durability. Existing routes, methods,
payloads, status codes, validation behavior and error envelope remain the public API.

**Alternatives considered**: Adding endpoints for storage health or migration status is
out of scope and would alter the API surface.

## Decision: Store task dates as stable serialized values

**Rationale**: The domain uses `Date` objects while HTTP exposes date-time strings. The
SQLite adapter should store a stable serialized representation and reconstruct `Date`
instances when returning domain tasks.

**Alternatives considered**: Storing database-local date types would add conversion
ambiguity in SQLite and is unnecessary for this local API.

