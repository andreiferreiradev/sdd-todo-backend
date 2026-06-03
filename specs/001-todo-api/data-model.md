# Data Model: Gerenciamento de Tarefas TODO

## Task

Representa um item de trabalho gerenciado pela API.

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `id` | string | yes | UUID v4 unico, gerado na criacao |
| `title` | string | yes | Remover espacos externos; rejeitar valor vazio |
| `description` | string | no | Texto opcional; pode ser removido em uma atualizacao |
| `status` | enum | yes | `pending` ou `completed`; inicia como `pending` |
| `createdAt` | string datetime | yes | Definido na criacao |
| `updatedAt` | string datetime | yes | Igual a `createdAt` na criacao; renovado em mudancas |

## State Transitions

```text
create
  |
  v
pending -- complete --> completed
```

- Concluir uma tarefa `completed` novamente e idempotente.
- Reabrir uma tarefa `completed` para `pending` esta fora do escopo.
- Atualizar titulo ou descricao nao altera o status.
- Remover uma tarefa e permitido em qualquer status.

## Application Errors

Erros de aplicacao sao convertidos pelo adaptador HTTP para o contrato comum:

| Code | HTTP Status | When |
|------|-------------|------|
| `VALIDATION_ERROR` | 400 | Entrada HTTP malformada ou invalida |
| `TASK_NOT_FOUND` | 404 | UUID valido sem tarefa correspondente |
| `INTERNAL_ERROR` | 500 | Falha inesperada nao exposta ao cliente |

Formato:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": []
}
```

`details` e opcional e pode listar problemas de validacao sem revelar dados sensiveis.

## Repository Port

`TaskRepository` fornece as operacoes minimas necessarias aos casos de uso:

```text
create(task)
findAll()
findById(id)
save(task)
delete(id)
```

O primeiro adaptador armazena tarefas em memoria. A porta nao assume tecnologia de banco.

## Input Shapes

### CreateTaskInput

| Field | Type | Required |
|-------|------|----------|
| `title` | string | yes |
| `description` | string | no |

### UpdateTaskInput

| Field | Type | Required |
|-------|------|----------|
| `title` | string | no |
| `description` | string or null | no |

Ao menos um campo deve estar presente. `description: null` remove a descricao existente.
