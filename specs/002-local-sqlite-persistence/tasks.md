# Tasks: Persistencia Local SQLite de Tarefas

**Input**: Design documents from `/specs/002-local-sqlite-persistence/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Automated tests are REQUIRED by the specification and constitution. Write test
tasks before the implementation tasks in each user story.

**Organization**: Tasks are grouped by user story so each story can be implemented and
tested independently after the shared foundation is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other marked tasks in the same phase
- **[Story]**: User story label for story phases only
- Every task includes an exact file path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add SQLite/Knex project dependencies and configuration entry points.

- [X] T001 Add `knex` and `sqlite3` runtime dependencies in package.json
- [X] T002 Run npm install to update package-lock.json
- [X] T003 [P] Add SQLite database configuration defaults including `SQLITE_FILENAME` fallback in src/config/database.ts
- [X] T004 [P] Add Knex connection factory skeleton in src/adapters/persistence/knex-connection.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core storage bootstrap and mapping infrastructure required by every story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Create Knex tasks table migration in src/adapters/persistence/migrations/001_create_tasks.ts
- [X] T006 Implement migration runner that prepares SQLite schema before HTTP serving in src/config/database.ts
- [X] T007 Implement Task row mapping helpers for Date serialization and reconstruction in src/adapters/persistence/knex-task-repository.ts
- [X] T008 Add persistence failure translation to standardized application errors in src/adapters/persistence/knex-task-repository.ts
- [X] T009 Update dependency composition to support async SQLite repository creation while preserving test overrides in src/config/dependencies.ts
- [X] T010 Update app bootstrap to accept prepared dependencies without controllers importing persistence details in src/app.ts
- [X] T011 Update server startup to run database preparation before `app.listen()` in src/server.ts

**Checkpoint**: SQLite schema preparation and repository wiring are ready for stories.

---

## Phase 3: User Story 1 - Manter tarefas apos reinicio (Priority: P1) MVP

**Goal**: Tasks created or changed before shutdown remain available after restart.

**Independent Test**: Create, update and complete tasks with one application/repository
instance, recreate the application/repository with the same SQLite file, then list and
fetch the same task IDs and latest state.

### Tests for User Story 1

- [X] T012 [P] [US1] Add SQLite repository persistence tests for create/find/list after reopening the same file in tests/integration/sqlite-task-repository.test.ts
- [X] T013 [P] [US1] Add restart workflow test covering create, update, complete and fetch after restart in tests/integration/task-persistence-workflow.test.ts
- [X] T014 [P] [US1] Add missing-file startup test proving migrations create schema and initial list is empty in tests/integration/startup-migrations.test.ts

### Implementation for User Story 1

- [X] T015 [US1] Implement `create`, `findAll`, and `findById` in src/adapters/persistence/knex-task-repository.ts
- [X] T016 [US1] Implement `save` and `delete` in src/adapters/persistence/knex-task-repository.ts
- [X] T017 [US1] Wire the SQLite-backed repository as the default runtime repository in src/config/dependencies.ts
- [X] T018 [US1] Ensure update and completion workflows persist latest `status` and `updatedAt` values through existing use cases in src/application/use-cases/update-task.ts and src/application/use-cases/complete-task.ts

**Checkpoint**: User Story 1 is functional and testable independently.

---

## Phase 4: User Story 2 - Preservar contrato da API existente (Priority: P1)

**Goal**: Existing HTTP clients continue using the same routes, methods, payloads, status
codes and error envelope with durable storage enabled.

**Independent Test**: Execute the existing TODO API contract scenarios against the SQLite
repository and compare responses with the documented unchanged OpenAPI contract.

### Tests for User Story 2

- [X] T019 [P] [US2] Add contract test setup that builds the HTTP app with a temporary SQLite repository in tests/contract/task-routes.test.ts
- [X] T020 [P] [US2] Add contract assertions for unchanged create, list, get, update, complete and delete responses in tests/contract/task-routes.test.ts
- [X] T021 [P] [US2] Add contract assertions for unchanged validation and not-found error envelopes in tests/contract/task-routes.test.ts
- [X] T022 [P] [US2] Add post-delete restart assertion that removed tasks do not reappear in tests/integration/task-persistence-workflow.test.ts

### Implementation for User Story 2

- [X] T023 [US2] Preserve existing task route handlers and dependency-only controller access in src/adapters/http/routes/task-routes.ts
- [X] T024 [US2] Preserve existing Zod schemas and HTTP input behavior in src/adapters/http/schemas/task-schemas.ts
- [X] T025 [US2] Preserve standardized error handling for validation, not-found and persistence failures in src/adapters/http/error-handler.ts
- [X] T026 [US2] Verify `contracts/openapi.yaml` remains API-compatible with specs/001-todo-api/contracts/openapi.yaml

**Checkpoint**: User Story 2 is functional and testable independently.

---

## Phase 5: User Story 3 - Isolar persistencia das regras de negocio (Priority: P2)

**Goal**: Persistence remains replaceable behind the repository port, with no direct
Knex/SQLite access from controllers, domain or use cases.

**Independent Test**: Unit tests continue to run with fake or in-memory repositories, and
integration tests exercise SQLite only through the repository behavior.

### Tests for User Story 3

- [X] T027 [P] [US3] Add architecture boundary test rejecting Knex/SQLite imports in HTTP controllers and application use cases in tests/integration/persistence-boundaries.test.ts
- [X] T028 [P] [US3] Confirm existing use case unit tests still use fakes or in-memory repositories in tests/unit/use-cases/create-task.test.ts
- [X] T029 [P] [US3] Add repository behavior tests for filtering and priority sorting through public repository/use-case behavior in tests/integration/sqlite-task-repository.test.ts

### Implementation for User Story 3

- [X] T030 [US3] Keep `TaskRepository` unchanged as the only application persistence port in src/application/ports/task-repository.ts
- [X] T031 [US3] Keep in-memory repository available for unit tests in src/adapters/persistence/in-memory-task-repository.ts
- [X] T032 [US3] Ensure Knex/SQLite imports are limited to persistence and database configuration modules in src/adapters/persistence/knex-task-repository.ts and src/config/database.ts

**Checkpoint**: User Story 3 is functional and testable independently.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, documentation alignment and cleanup.

- [X] T033 [P] Update README persistence setup notes for `SQLITE_FILENAME` and migrations in README.md
- [X] T034 [P] Validate quickstart commands and persistence restart scenario in specs/002-local-sqlite-persistence/quickstart.md
- [X] T035 Run npm run typecheck and fix TypeScript issues in src/
- [X] T036 Run npm test and fix failing tests in tests/
- [X] T037 Run npm run build and fix production build issues in tsconfig.json or src/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2. This is the MVP.
- **Phase 4 US2**: Depends on Phase 2 and can run after or alongside US1 once shared SQLite wiring exists.
- **Phase 5 US3**: Depends on Phase 2 and can run alongside US1/US2 after shared wiring exists.
- **Phase 6 Polish**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundation.
- **US2 (P1)**: No functional dependency on US1, but uses the same SQLite wiring.
- **US3 (P2)**: No functional dependency on US1/US2, but validates boundaries after SQLite modules exist.

### Within Each User Story

- Write tests first and confirm they fail before implementation.
- Implement repository/storage behavior before runtime wiring.
- Preserve existing HTTP schemas/routes before changing tests that assert API compatibility.
- Complete each story checkpoint before moving to the next priority if working sequentially.

---

## Parallel Execution Examples

### User Story 1

```text
Task: "T012 Add SQLite repository persistence tests in tests/integration/sqlite-task-repository.test.ts"
Task: "T013 Add restart workflow test in tests/integration/task-persistence-workflow.test.ts"
Task: "T014 Add missing-file startup test in tests/integration/startup-migrations.test.ts"
```

### User Story 2

```text
Task: "T019 Add SQLite contract setup in tests/contract/task-routes.test.ts"
Task: "T020 Add unchanged success response assertions in tests/contract/task-routes.test.ts"
Task: "T021 Add unchanged error envelope assertions in tests/contract/task-routes.test.ts"
Task: "T022 Add post-delete restart assertion in tests/integration/task-persistence-workflow.test.ts"
```

### User Story 3

```text
Task: "T027 Add architecture boundary test in tests/integration/persistence-boundaries.test.ts"
Task: "T028 Confirm unit tests still use fakes in tests/unit/use-cases/create-task.test.ts"
Task: "T029 Add filtering/sorting repository behavior tests in tests/integration/sqlite-task-repository.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 US1.
4. Stop and validate persistence across restart with `npm test`.

### Incremental Delivery

1. Deliver US1 for durable local storage.
2. Deliver US2 to prove the HTTP contract remains unchanged.
3. Deliver US3 to prove persistence remains isolated behind the port.
4. Complete polish checks and quickstart validation.

### Parallel Team Strategy

After Phase 2, one developer can focus on repository durability tests and behavior, one on
HTTP contract preservation, and one on architecture boundary tests. Coordinate changes to
shared files `src/config/dependencies.ts`, `src/config/database.ts`, and
`src/adapters/persistence/knex-task-repository.ts`.

---

## Notes

- [P] tasks are parallelizable because they touch different files or independent test
  sections.
- All story tasks include `[US1]`, `[US2]` or `[US3]` for traceability.
- The feature must not alter the public API contract.
- `tasks.md` completes the Spec Kit artifact gate before implementation begins.
