# SDD Todo API

API HTTP didatica para gerenciar tarefas TODO com TypeScript, Fastify, Zod e arquitetura
hexagonal.

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

As tarefas ficam em memoria e sao perdidas quando o processo encerra. O adaptador pode ser
substituido por persistencia duravel sem mover regras de negocio para a camada HTTP.

Erros expostos seguem o formato:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": []
}
```
