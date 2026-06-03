# Feature Specification: Gerenciamento de Tarefas TODO

**Feature Branch**: `001-todo-api`

**Created**: 2026-06-01

**Status**: Draft

**Input**: User description: "Criar uma API TODO em TypeScript onde o usuario consiga
criar, listar, buscar por id, atualizar, concluir e remover tarefas. Cada tarefa deve ter
id UUID v4, titulo obrigatorio, descricao opcional, status pending ou completed, createdAt
e updatedAt. A API deve validar entradas e retornar erros padronizados."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar tarefa (Priority: P1)

O usuario registra uma nova tarefa informando um titulo e, opcionalmente, uma descricao.

**Why this priority**: Criar tarefas e o ponto de entrada indispensavel para qualquer
outro fluxo.

**Independent Test**: Criar uma tarefa com titulo valido e verificar que ela recebe
identificador, status inicial e datas de criacao e atualizacao.

**Acceptance Scenarios**:

1. **Given** um titulo valido, **When** o usuario cria uma tarefa, **Then** a tarefa e
   registrada com identificador unico, status `pending`, `createdAt` e `updatedAt`.
2. **Given** um titulo valido e uma descricao, **When** o usuario cria uma tarefa,
   **Then** a descricao e preservada na tarefa registrada.
3. **Given** um titulo ausente, vazio ou composto apenas por espacos, **When** o usuario
   tenta criar uma tarefa, **Then** a operacao falha com erro padronizado de validacao.

---

### User Story 2 - Consultar tarefas (Priority: P1)

O usuario lista as tarefas existentes e busca uma tarefa especifica pelo identificador.

**Why this priority**: Consultar o trabalho registrado e essencial para acompanhar e
selecionar tarefas.

**Independent Test**: Registrar tarefas, listar a colecao e buscar uma delas pelo
identificador retornado na criacao.

**Acceptance Scenarios**:

1. **Given** nenhuma tarefa registrada, **When** o usuario lista tarefas, **Then** recebe
   uma lista vazia.
2. **Given** tarefas registradas, **When** o usuario lista tarefas, **Then** recebe todas
   as tarefas existentes.
3. **Given** uma tarefa registrada, **When** o usuario busca seu identificador, **Then**
   recebe os dados completos da tarefa.
4. **Given** um identificador valido sem tarefa correspondente, **When** o usuario busca
   por ele, **Then** recebe um erro padronizado de tarefa nao encontrada.

---

### User Story 3 - Atualizar tarefa (Priority: P2)

O usuario altera o titulo ou a descricao de uma tarefa existente.

**Why this priority**: Tarefas evoluem depois do registro inicial e precisam continuar
representando o trabalho real.

**Independent Test**: Criar uma tarefa, alterar seus dados editaveis e confirmar que os
novos valores e a data de atualizacao foram persistidos.

**Acceptance Scenarios**:

1. **Given** uma tarefa existente, **When** o usuario altera o titulo ou a descricao,
   **Then** os novos valores sao salvos e `updatedAt` e atualizado.
2. **Given** uma tarefa existente, **When** o usuario tenta definir um titulo vazio ou
   composto apenas por espacos, **Then** a operacao falha com erro padronizado de
   validacao.
3. **Given** um identificador valido sem tarefa correspondente, **When** o usuario tenta
   atualizar a tarefa, **Then** recebe um erro padronizado de tarefa nao encontrada.

---

### User Story 4 - Concluir tarefa (Priority: P2)

O usuario marca uma tarefa pendente como concluida.

**Why this priority**: A conclusao permite acompanhar quais itens ainda exigem trabalho.

**Independent Test**: Criar uma tarefa pendente, conclui-la e verificar que seu status e
`completed` e sua data de atualizacao foi renovada.

**Acceptance Scenarios**:

1. **Given** uma tarefa com status `pending`, **When** o usuario conclui a tarefa,
   **Then** seu status passa a `completed` e `updatedAt` e atualizado.
2. **Given** uma tarefa com status `completed`, **When** o usuario solicita sua conclusao
   novamente, **Then** a tarefa permanece concluida sem erro.
3. **Given** um identificador valido sem tarefa correspondente, **When** o usuario tenta
   concluir a tarefa, **Then** recebe um erro padronizado de tarefa nao encontrada.

---

### User Story 5 - Remover tarefa (Priority: P3)

O usuario remove uma tarefa que nao deseja mais manter.

**Why this priority**: A remocao mantem a lista relevante, embora nao seja necessaria para
o primeiro uso da aplicacao.

**Independent Test**: Criar uma tarefa, remove-la e verificar que ela deixa de aparecer
na listagem e nao pode mais ser encontrada.

**Acceptance Scenarios**:

1. **Given** uma tarefa existente, **When** o usuario remove a tarefa, **Then** ela deixa
   de existir na colecao.
2. **Given** um identificador valido sem tarefa correspondente, **When** o usuario tenta
   remover a tarefa, **Then** recebe um erro padronizado de tarefa nao encontrada.

### Edge Cases

- Identificadores que nao representam UUIDs validos MUST ser rejeitados antes da busca.
- Campos desconhecidos enviados pelo usuario MUST NOT alterar dados da tarefa.
- Uma atualizacao sem nenhum campo editavel MUST ser rejeitada como entrada invalida.
- `updatedAt` MUST ser igual a `createdAt` na criacao e renovado quando a tarefa mudar.
- Uma tarefa concluida pode ser consultada, atualizada e removida normalmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar uma tarefa com titulo obrigatorio e descricao
  opcional.
- **FR-002**: O sistema MUST rejeitar titulos ausentes, vazios ou compostos apenas por
  espacos.
- **FR-003**: O sistema MUST gerar um identificador UUID v4 unico para cada nova tarefa.
- **FR-004**: O sistema MUST atribuir status inicial `pending` a cada nova tarefa.
- **FR-005**: O sistema MUST registrar `createdAt` e `updatedAt` para cada tarefa.
- **FR-006**: O sistema MUST permitir listar todas as tarefas existentes.
- **FR-007**: O sistema MUST permitir buscar uma tarefa pelo identificador.
- **FR-008**: O sistema MUST permitir atualizar o titulo ou a descricao de uma tarefa.
- **FR-009**: O sistema MUST atualizar `updatedAt` sempre que os dados ou o status de uma
  tarefa mudarem.
- **FR-010**: O sistema MUST permitir concluir uma tarefa, alterando seu status para
  `completed`.
- **FR-011**: O sistema MUST tratar a conclusao repetida de uma tarefa como uma operacao
  idempotente.
- **FR-012**: O sistema MUST permitir remover uma tarefa existente.
- **FR-013**: O sistema MUST rejeitar identificadores malformados e entradas invalidas.
- **FR-014**: O sistema MUST retornar erro padronizado ao tentar buscar, atualizar,
  concluir ou remover uma tarefa inexistente.
- **FR-015**: Todo erro exposto MUST conter um codigo estavel e uma mensagem legivel,
  podendo incluir detalhes relevantes para diagnostico.

### Constitutional Requirements *(mandatory when applicable)*

- **HTTP Inputs**: Todas as entradas de criacao, busca por identificador, atualizacao,
  conclusao e remocao MUST ser validadas com Zod antes de alcancar regras de negocio.
- **Entity IDs**: A entidade Tarefa MUST receber UUID v4 ao ser criada.
- **Error Cases**: Entradas invalidas, identificadores malformados e tarefas inexistentes
  MUST usar o formato padronizado `{ code, message, details? }`.
- **Automated Tests**: A feature MUST cobrir regras de negocio, validacao das entradas,
  contratos HTTP, operacoes bem-sucedidas e erros esperados.

### Key Entities

- **Tarefa**: Item de trabalho com `id`, `title`, `description`, `status`, `createdAt` e
  `updatedAt`. O status permitido e `pending` ou `completed`.
- **Erro Padronizado**: Falha exposta ao usuario com `code`, `message` e `details`
  opcional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuarios conseguem criar, consultar, atualizar, concluir e remover tarefas
  validas em 100% dos cenarios de aceitacao.
- **SC-002**: 100% das tarefas criadas recebem identificador unico, status inicial
  `pending` e datas de criacao e atualizacao.
- **SC-003**: 100% das entradas invalidas descritas nesta especificacao sao rejeitadas com
  erro padronizado sem modificar tarefas existentes.
- **SC-004**: Uma tarefa criada pode ser localizada na listagem e por seu identificador
  imediatamente apos o registro.
- **SC-005**: Depois da remocao, uma tarefa deixa de aparecer na listagem e nao pode mais
  ser localizada pelo identificador.

## Assumptions

- A primeira versao nao inclui autenticacao, autorizacao ou separacao de tarefas por
  usuario.
- A listagem retorna todas as tarefas existentes; paginacao, filtros e ordenacao
  configuravel ficam fora do escopo inicial.
- A atualizacao edita titulo e descricao. A mudanca para `completed` ocorre pela operacao
  explicita de conclusao.
- Reabrir uma tarefa concluida para `pending` fica fora do escopo inicial.
- A persistencia definitiva e a estrategia de armazenamento serao definidas no plano.
