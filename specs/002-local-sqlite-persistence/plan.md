# Implementation Plan: Persistencia Local SQLite de Tarefas

**Branch**: `002-local-sqlite-persistence` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-local-sqlite-persistence/spec.md`

## Summary

Adicionar persistencia local duravel para tarefas usando SQLite acessado por Knex, sem
alterar o contrato HTTP existente. A implementacao mantem a arquitetura hexagonal: casos
de uso dependem somente da porta `TaskRepository`, controllers HTTP chamam apenas casos de
uso, e o acesso a Knex/SQLite fica restrito ao adaptador de persistencia. A inicializacao
deve executar migrations antes de servir requisicoes, criando o arquivo local quando ele
ainda nao existir.

## Technical Context

**Language/Version**: TypeScript 5.9 executado em Node.js 24 LTS

**Primary Dependencies**: Fastify 5 para HTTP; Zod 4 para validacao; Knex para acesso a
dados; `sqlite3` como driver SQLite

**Storage**: SQLite local em arquivo, configurado por `SQLITE_FILENAME` com fallback local
para desenvolvimento/testes; schema preparado por migrations Knex antes de `app.listen()`

**Testing**: Node.js test runner; `fastify.inject()` para contratos HTTP; arquivos SQLite
temporarios para testes de persistencia e reinicio

**Target Platform**: Servidor Node.js local ou Linux

**Project Type**: Web service HTTP de projeto unico

**Performance Goals**: Operacoes locais respondem em ate 200 ms no ambiente de
desenvolvimento para ate 1.000 tarefas persistidas localmente

**Constraints**: Arquitetura hexagonal; controllers finos; Zod em toda entrada HTTP;
UUID v4; erros `{ code, message, details? }`; contrato HTTP inalterado; migrations
concluidas antes de servir requisicoes; controllers e casos de uso sem acesso direto a
Knex ou SQLite

**Scale/Scope**: Uma instancia local, um arquivo SQLite local e as seis operacoes HTTP
existentes sobre tarefas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Application code is implemented in TypeScript.
- [x] Every HTTP input validates body, query params, route params, and used headers with Zod.
- [x] The structure separates domain, application, ports, and adapters.
- [x] Controllers only translate HTTP requests and responses and invoke use cases.
- [x] Automated tests cover every feature and relevant HTTP contracts and integrations.
- [x] Added complexity is justified and the simplest viable design was considered.
- [x] New entity IDs are generated as UUID v4.
- [x] Exposed errors follow the documented standard format.
- [x] `spec.md`, `plan.md`, and `tasks.md` exist before implementation begins.

**Post-design re-check**: Passed. The design keeps HTTP, application and persistence
boundaries separate; the existing API contract remains unchanged; SQLite/Knex complexity
is limited to the persistence adapter and migration bootstrap required for durable local
storage.

## Project Structure

### Documentation (this feature)

```text
specs/002-local-sqlite-persistence/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- openapi.yaml
`-- tasks.md             # Created by /speckit-tasks before implementation
```

### Source Code (repository root)

```text
src/
|-- domain/
|   |-- entities/
|   |   `-- task.ts
|   `-- errors/
|       `-- application-error.ts
|-- application/
|   |-- ports/
|   |   |-- task-repository.ts
|   |   |-- id-generator.ts
|   |   `-- clock.ts
|   `-- use-cases/
|       |-- create-task.ts
|       |-- list-tasks.ts
|       |-- get-task.ts
|       |-- update-task.ts
|       |-- complete-task.ts
|       `-- delete-task.ts
|-- adapters/
|   |-- http/
|   |   |-- schemas/
|   |   |   `-- task-schemas.ts
|   |   |-- routes/
|   |   |   `-- task-routes.ts
|   |   `-- error-handler.ts
|   `-- persistence/
|       |-- in-memory-task-repository.ts
|       |-- knex-task-repository.ts
|       |-- knex-connection.ts
|       `-- migrations/
|           `-- 001_create_tasks.ts
|-- config/
|   |-- dependencies.ts
|   `-- database.ts
|-- app.ts
`-- server.ts

tests/
|-- unit/
|   |-- task.test.ts
|   `-- use-cases/
|-- contract/
|   `-- task-routes.test.ts
|-- integration/
|   |-- sqlite-task-repository.test.ts
|   |-- task-persistence-workflow.test.ts
|   `-- startup-migrations.test.ts
`-- helpers/
    `-- fakes.ts
```

**Structure Decision**: Continuar com um unico projeto TypeScript. O nucleo de dominio e
aplicacao permanece sem dependencia de Fastify, Zod, Knex ou SQLite. A composicao em
`src/config/dependencies.ts` passa a receber o repositorio SQLite por padrao para execucao
real, mantendo o repositorio em memoria para testes unitarios. A preparacao de banco fica
em configuracao/bootstrap antes de registrar escuta HTTP.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Nenhuma | N/A | N/A |

