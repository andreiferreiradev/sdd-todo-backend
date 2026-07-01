# Quickstart: Persistencia Local SQLite de Tarefas

## Prerequisites

- Node.js 24 LTS
- npm

## Install and Configure

After implementation:

```powershell
npm install
```

Optionally choose the local SQLite file:

```powershell
$env:SQLITE_FILENAME = ".data/todos.sqlite"
```

If `SQLITE_FILENAME` is not set, the application uses `.data/todos.sqlite`.

## Run

```powershell
npm run dev
```

Startup must prepare the SQLite schema through migrations before the server listens on
`http://localhost:3000`. If the database file does not exist yet, startup may create it.

## Validate

```powershell
npm run typecheck
npm test
npm run build
```

## Exercise Persistence

Create a task:

```powershell
$task = Invoke-RestMethod -Method Post -Uri http://localhost:3000/tasks `
  -ContentType 'application/json' `
  -Body '{"title":"Persistir tarefas","description":"Validar SQLite local","priority":2}'
$task
```

Stop and restart the application, then list and fetch the same task:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/tasks
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/tasks/$($task.id)"
```

The response contract is unchanged from the original TODO API.

## Expected Error Format

Validation, not-found and persistence failures exposed through HTTP keep the project error
envelope:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": []
}
```
