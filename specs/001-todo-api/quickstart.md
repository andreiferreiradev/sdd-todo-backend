# Quickstart: Gerenciamento de Tarefas TODO

## Prerequisites

- Node.js 24 LTS
- npm

## Install and Run

Depois da implementacao:

```powershell
npm install
npm run dev
```

O servidor local deve iniciar em `http://localhost:3000`.

## Validate

```powershell
npm run typecheck
npm test
npm run build
```

## Exercise the API

Criar uma tarefa:

```powershell
$task = Invoke-RestMethod -Method Post -Uri http://localhost:3000/tasks `
  -ContentType 'application/json' `
  -Body '{"title":"Estudar arquitetura hexagonal","description":"Ler o plano"}'
$task
```

Listar e buscar:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3000/tasks
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/tasks/$($task.id)"
```

Atualizar e concluir:

```powershell
Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/tasks/$($task.id)" `
  -ContentType 'application/json' `
  -Body '{"description":"Implementar os casos de uso"}'

Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/tasks/$($task.id)/complete"
```

Remover:

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:3000/tasks/$($task.id)"
```

## Expected Error Format

Entradas invalidas e tarefas inexistentes retornam:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": []
}
```
