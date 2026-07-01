# SDD Todo API

API HTTP didatica para gerenciar tarefas TODO com TypeScript, Fastify, Zod, SQLite local e
arquitetura hexagonal.

## Requirements

- Node.js 24 LTS
- npm

## Commands

```powershell
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

O servidor inicia em `http://localhost:3000`. Use `PORT` para escolher outra porta.

## Persistence

As tarefas sao persistidas em um arquivo SQLite local preparado por migrations antes de o
servidor atender requisicoes. Use `SQLITE_FILENAME` para escolher o arquivo:

```powershell
$env:SQLITE_FILENAME = ".data/todos.sqlite"
npm run dev
```

Se `SQLITE_FILENAME` nao for informado, a aplicacao usa `.data/todos.sqlite`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/tasks` | Criar tarefa |
| `GET` | `/tasks` | Listar tarefas |
| `GET` | `/tasks/:id` | Buscar tarefa |
| `PATCH` | `/tasks/:id` | Atualizar titulo ou descricao |
| `PATCH` | `/tasks/:id/complete` | Concluir tarefa |
| `DELETE` | `/tasks/:id` | Remover tarefa |

## Example

```powershell
$task = Invoke-RestMethod -Method Post -Uri http://localhost:3000/tasks `
  -ContentType 'application/json' `
  -Body '{"title":"Estudar TypeScript","description":"Executar os testes"}'

Invoke-RestMethod -Method Patch -Uri "http://localhost:3000/tasks/$($task.id)/complete"
Invoke-RestMethod -Method Get -Uri http://localhost:3000/tasks
```

## Notes

O acesso a SQLite/Knex fica restrito ao adaptador de persistencia e ao bootstrap de banco.
Controllers HTTP chamam apenas casos de uso, e os casos de uso dependem somente da porta
de repositorio.

Erros expostos seguem o formato:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": []
}
```
