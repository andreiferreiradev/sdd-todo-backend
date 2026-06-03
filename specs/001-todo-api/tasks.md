# Tasks: Gerenciamento de Tarefas TODO

**Input**: Design documents from `/specs/001-todo-api/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/openapi.yaml`, `quickstart.md`

**Tests**: Automated tests are required by the project constitution. Each user story starts
with tests that must fail before its implementation tasks begin.

**Organization**: Tasks are grouped by user story so each increment remains independently
testable and useful.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no dependency on
  another incomplete task in the same phase.
- **[Story]**: Maps a task to its user story.
- Every task includes an exact file path.

## Phase 1: Setup

**Purpose**: Initialize the TypeScript project and its developer commands.

- [x] T001 Create npm project metadata and scripts for `dev`, `build`, `typecheck`, and `test` in `package.json`
- [x] T002 Install runtime dependencies `fastify` and `zod` and development dependencies for TypeScript execution in `package.json`
- [x] T003 [P] Configure strict TypeScript compilation for `src/` and `tests/` in `tsconfig.json`
- [x] T004 [P] Create source and test directory placeholders in `src/.gitkeep` and `tests/.gitkeep`

**Checkpoint**: Dependency installation and TypeScript commands are available.

---

## Phase 2: Foundational

**Purpose**: Build the hexagonal boundaries shared by every story.

**CRITICAL**: No user story work starts before this phase is complete.

- [x] T005 [P] Define the `Task` entity, `TaskStatus`, trimming rules, update behavior, and completion transition in `src/domain/entities/task.ts`
- [x] T006 [P] Define standardized application errors and codes in `src/domain/errors/application-error.ts`
- [x] T007 [P] Define repository operations in `src/application/ports/task-repository.ts`
- [x] T008 [P] Define the injectable ID generator contract in `src/application/ports/id-generator.ts`
- [x] T009 [P] Define the injectable clock contract in `src/application/ports/clock.ts`
- [x] T010 Implement the in-memory repository adapter with `Map` storage in `src/adapters/persistence/in-memory-task-repository.ts`
- [x] T011 [P] Implement Zod schemas for strict request bodies and UUID route params in `src/adapters/http/schemas/task-schemas.ts`
- [x] T012 [P] Implement HTTP error mapping for validation, not-found, and internal failures in `src/adapters/http/error-handler.ts`
- [x] T013 [P] Add unit tests for entity creation, trimming, updates, completion idempotency, and standardized errors in `tests/unit/task.test.ts`
- [x] T014 Compose repository, ID generator using `node:crypto.randomUUID()`, clock, and use-case placeholders in `src/config/dependencies.ts`
- [x] T015 Create the Fastify application factory and register shared error handling in `src/app.ts`
- [x] T016 Create the HTTP server entry point listening on the configured port in `src/server.ts`

**Checkpoint**: Shared domain rules, ports, adapters, and application bootstrap compile.

---

## Phase 3: User Story 1 - Criar tarefa (Priority: P1) MVP

**Goal**: Register a task with UUID v4, trimmed title, optional description, pending status,
and timestamps.

**Independent Test**: Send a valid creation request and verify the returned task; send
invalid or unknown fields and verify standardized validation errors.

### Tests for User Story 1

- [x] T017 [P] [US1] Add create-task unit tests for generated UUID, pending status, timestamps, description, and invalid titles in `tests/unit/use-cases/create-task.test.ts`
- [x] T018 [P] [US1] Add `POST /tasks` contract tests for success, missing title, blank title, and unknown fields in `tests/contract/task-routes.test.ts`

### Implementation for User Story 1

- [x] T019 [US1] Implement create-task orchestration with repository, ID generator, and clock ports in `src/application/use-cases/create-task.ts`
- [x] T020 [US1] Register `POST /tasks` with Zod body parsing and thin controller delegation in `src/adapters/http/routes/task-routes.ts`
- [x] T021 [US1] Wire create-task dependencies and task routes into the application factory in `src/config/dependencies.ts` and `src/app.ts`

**Checkpoint**: A task can be created independently and invalid creation input is rejected.

---

## Phase 4: User Story 2 - Consultar tarefas (Priority: P1)

**Goal**: List every task and retrieve one task by UUID.

**Independent Test**: List an empty collection, create tasks, list them, fetch one by UUID,
and verify validation and not-found errors.

### Tests for User Story 2

- [x] T022 [P] [US2] Add list-task and get-task unit tests for empty, populated, found, and not-found cases in `tests/unit/use-cases/query-tasks.test.ts`
- [x] T023 [P] [US2] Add `GET /tasks` and `GET /tasks/{id}` contract tests for success, malformed UUID, and missing task in `tests/contract/task-routes.test.ts`

### Implementation for User Story 2

- [x] T024 [P] [US2] Implement list-tasks orchestration in `src/application/use-cases/list-tasks.ts`
- [x] T025 [P] [US2] Implement get-task orchestration and not-found error in `src/application/use-cases/get-task.ts`
- [x] T026 [US2] Register `GET /tasks` and `GET /tasks/:id` with route-param validation in `src/adapters/http/routes/task-routes.ts`
- [x] T027 [US2] Wire query use cases into route dependencies in `src/config/dependencies.ts`

**Checkpoint**: Created tasks can be listed and fetched independently.

---

## Phase 5: User Story 3 - Atualizar tarefa (Priority: P2)

**Goal**: Update a task title or description and renew `updatedAt`.

**Independent Test**: Update title, update description, remove description with `null`,
and reject empty bodies, blank titles, unknown fields, malformed UUIDs, and missing tasks.

### Tests for User Story 3

- [x] T028 [P] [US3] Add update-task unit tests for editable fields, description removal, timestamp renewal, and not-found behavior in `tests/unit/use-cases/update-task.test.ts`
- [x] T029 [P] [US3] Add `PATCH /tasks/{id}` contract tests for success and validation failures in `tests/contract/task-routes.test.ts`

### Implementation for User Story 3

- [x] T030 [US3] Implement update-task orchestration with clock-based timestamp renewal in `src/application/use-cases/update-task.ts`
- [x] T031 [US3] Register `PATCH /tasks/:id` with strict Zod body and route-param validation in `src/adapters/http/routes/task-routes.ts`
- [x] T032 [US3] Wire update-task dependencies into routes in `src/config/dependencies.ts`

**Checkpoint**: Editable fields change without modifying status and invalid updates are rejected.

---

## Phase 6: User Story 4 - Concluir tarefa (Priority: P2)

**Goal**: Mark a pending task as completed while preserving idempotency.

**Independent Test**: Complete a pending task, repeat completion, and verify malformed UUID
and missing-task errors.

### Tests for User Story 4

- [x] T033 [P] [US4] Add complete-task unit tests for transition, timestamp renewal, idempotency, and not-found behavior in `tests/unit/use-cases/complete-task.test.ts`
- [x] T034 [P] [US4] Add `PATCH /tasks/{id}/complete` contract tests for success, repeat completion, malformed UUID, and missing task in `tests/contract/task-routes.test.ts`

### Implementation for User Story 4

- [x] T035 [US4] Implement complete-task orchestration with idempotent domain transition in `src/application/use-cases/complete-task.ts`
- [x] T036 [US4] Register `PATCH /tasks/:id/complete` with route-param validation in `src/adapters/http/routes/task-routes.ts`
- [x] T037 [US4] Wire complete-task dependencies into routes in `src/config/dependencies.ts`

**Checkpoint**: Pending tasks become completed and repeat requests remain safe.

---

## Phase 7: User Story 5 - Remover tarefa (Priority: P3)

**Goal**: Remove a task in either status.

**Independent Test**: Remove pending and completed tasks, then verify they disappear from
list and lookup operations; reject malformed UUIDs and missing tasks.

### Tests for User Story 5

- [x] T038 [P] [US5] Add delete-task unit tests for pending, completed, and not-found behavior in `tests/unit/use-cases/delete-task.test.ts`
- [x] T039 [P] [US5] Add `DELETE /tasks/{id}` contract tests for success, malformed UUID, and missing task in `tests/contract/task-routes.test.ts`

### Implementation for User Story 5

- [x] T040 [US5] Implement delete-task orchestration and not-found behavior in `src/application/use-cases/delete-task.ts`
- [x] T041 [US5] Register `DELETE /tasks/:id` with route-param validation and `204` response in `src/adapters/http/routes/task-routes.ts`
- [x] T042 [US5] Wire delete-task dependencies into routes in `src/config/dependencies.ts`

**Checkpoint**: Tasks can be removed and are no longer observable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete workflow and keep the project approachable for study.

- [x] T043 Add end-to-end workflow coverage for create, list, fetch, update, complete, and delete in `tests/integration/task-workflow.test.ts`
- [x] T044 [P] Document setup, scripts, API examples, and in-memory storage limitation in `README.md`
- [x] T045 Review the implemented API against `specs/001-todo-api/contracts/openapi.yaml` and update the contract only if implementation discoveries require a documented correction
- [x] T046 Run `npm run typecheck`, `npm test`, and `npm run build` and record any quickstart corrections in `specs/001-todo-api/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Starts immediately.
- **Foundational (Phase 2)**: Depends on setup and blocks all user stories.
- **US1 Criar tarefa (Phase 3)**: Depends on foundational work and delivers the MVP.
- **US2 Consultar tarefas (Phase 4)**: Depends on foundational work; contract verification
  benefits from US1 because created records are convenient fixtures.
- **US3 Atualizar tarefa (Phase 5)**: Depends on US1 and repository foundations.
- **US4 Concluir tarefa (Phase 6)**: Depends on US1 and repository foundations.
- **US5 Remover tarefa (Phase 7)**: Depends on US1 and repository foundations.
- **Polish (Phase 8)**: Depends on every selected user story.

### User Story Dependency Graph

```text
Setup -> Foundational -> US1 Create
                         |-> US2 Query
                         |-> US3 Update
                         |-> US4 Complete
                         `-> US5 Delete

US1 + US2 + US3 + US4 + US5 -> Polish
```

After US1, US2 through US5 may be implemented in parallel by separate developers because
their cases of use live in separate files. Route registration tasks in
`src/adapters/http/routes/task-routes.ts` must be sequenced or coordinated.

### Within Each User Story

- Write tests first and verify they fail for the expected missing behavior.
- Implement the application use case.
- Register the thin HTTP controller with Zod validation.
- Wire dependencies.
- Run the story-specific tests before proceeding.

## Parallel Opportunities

- T003 and T004 can run in parallel during setup.
- T005 through T009, T011 through T013 can run in parallel during foundational work.
- Each story's unit and contract test tasks can run in parallel.
- After US1, implementation work for US2, US3, US4, and US5 can run in parallel except
  edits to `task-routes.ts` and `dependencies.ts`.
- T044 can run in parallel with final validation work.

## Parallel Examples

### User Story 1

```text
T017 Add create-task unit tests in tests/unit/use-cases/create-task.test.ts
T018 Add POST /tasks contract tests in tests/contract/task-routes.test.ts
```

### User Story 2

```text
T022 Add query unit tests in tests/unit/use-cases/query-tasks.test.ts
T023 Add GET contract tests in tests/contract/task-routes.test.ts
T024 Implement list use case in src/application/use-cases/list-tasks.ts
T025 Implement get use case in src/application/use-cases/get-task.ts
```

### User Stories 3, 4, and 5

```text
T030 Implement update use case in src/application/use-cases/update-task.ts
T035 Implement complete use case in src/application/use-cases/complete-task.ts
T040 Implement delete use case in src/application/use-cases/delete-task.ts
```

## Implementation Strategy

### MVP First

1. Complete setup and foundational work.
2. Complete US1 creation tests and implementation.
3. Validate `POST /tasks` independently.
4. Continue with query support before broadening mutation operations.

### Incremental Delivery

1. Deliver task creation.
2. Add listing and lookup.
3. Add editing.
4. Add completion.
5. Add deletion.
6. Run the full workflow and quickstart validation.

## Notes

- Do not implement code before this `tasks.md` exists.
- Keep controllers limited to validation, use-case invocation, and HTTP translation.
- Preserve `{ code, message, details? }` for every exposed error.
- Keep the in-memory adapter replaceable through `TaskRepository`.
