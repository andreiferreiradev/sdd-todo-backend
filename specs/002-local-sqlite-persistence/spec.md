# Feature Specification: Persistencia Local de Tarefas

**Feature Branch**: `002-local-sqlite-persistence`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "Adicionar persistencia local de tarefas usando sqlite e a lib Knex (para ser usado nos repositorios) mantendo a estrutura hexagonal e as boas praticas"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter tarefas apos reinicio (Priority: P1)

O usuario cria e altera tarefas e espera que esses dados continuem disponiveis depois que
a aplicacao for encerrada e iniciada novamente.

**Why this priority**: Sem persistencia duravel, a API perde o principal valor assim que o
processo termina.

**Independent Test**: Criar tarefas, encerrar e reiniciar a aplicacao, listar as tarefas e
buscar uma tarefa especifica pelo identificador original.

**Acceptance Scenarios**:

1. **Given** tarefas ja criadas, **When** a aplicacao e reiniciada, **Then** as tarefas
   continuam disponiveis na listagem.
2. **Given** uma tarefa criada antes do reinicio, **When** o usuario busca pelo mesmo
   identificador depois do reinicio, **Then** recebe os dados completos da tarefa.
3. **Given** uma tarefa atualizada ou concluida antes do reinicio, **When** o usuario a
   consulta depois do reinicio, **Then** encontra o ultimo estado confirmado.

---

### User Story 2 - Preservar contrato da API existente (Priority: P1)

O usuario continua usando as mesmas operacoes de criacao, listagem, busca, atualizacao,
conclusao e remocao, sem qualquer mudanca nos endpoints, metodos HTTP, parametros,
payloads de entrada, payloads de resposta, codigos de status ou formato de erros.

**Why this priority**: A persistencia deve melhorar a durabilidade sem quebrar clientes ou
regras ja definidas.

**Independent Test**: Executar os cenarios de contrato da API TODO existente usando o novo
armazenamento duravel e comparar os resultados esperados.

**Acceptance Scenarios**:

1. **Given** uma requisicao valida ja aceita pela API, **When** ela e executada com o
   armazenamento duravel, **Then** a resposta mantem o mesmo formato e significado.
2. **Given** uma entrada invalida ja rejeitada pela API, **When** ela e executada com o
   armazenamento duravel, **Then** recebe o mesmo tipo de erro padronizado.
3. **Given** uma tarefa removida, **When** a aplicacao e reiniciada, **Then** a tarefa nao
   reaparece na listagem nem pode ser encontrada pelo identificador.
4. **Given** um cliente que usa o contrato HTTP existente, **When** a persistencia local e
   adicionada, **Then** o cliente nao precisa alterar nenhuma requisicao nem tratamento de
   resposta.

---

### User Story 3 - Isolar persistencia das regras de negocio (Priority: P2)

O mantenedor do projeto consegue evoluir o armazenamento sem alterar regras de dominio,
casos de uso ou controllers HTTP.

**Why this priority**: O projeto exige arquitetura hexagonal e precisa manter a
persistencia como adaptador substituivel.

**Independent Test**: Validar que os casos de uso continuam dependendo apenas da porta de
repositorio e que a nova persistencia pode ser exercitada por testes de integracao.

**Acceptance Scenarios**:

1. **Given** a porta de repositorio existente, **When** a persistencia duravel e usada,
   **Then** os casos de uso continuam acessando tarefas apenas por essa porta.
2. **Given** testes unitarios dos casos de uso, **When** eles rodam com repositorios de
   teste ou memoria, **Then** nao precisam de armazenamento duravel para passar.
3. **Given** testes de integracao de persistencia, **When** eles executam operacoes de
   criacao, atualizacao, conclusao e remocao, **Then** verificam os dados armazenados por
   meio do comportamento publico do repositorio.
4. **Given** uma requisicao HTTP, **When** o controller processa a chamada, **Then** ele
   usa apenas os casos de uso da aplicacao e nao acessa diretamente Knex, SQLite ou outro
   detalhe de armazenamento.

### Edge Cases

- O aplicativo deve ser capaz de iniciar quando o arquivo SQLite local ainda nao existir;
  nessa situacao, o arquivo pode ser criado durante a preparacao do armazenamento, mas o
  schema deve ser preparado por migrations concluidas com sucesso antes de qualquer
  requisicao HTTP ser atendida.
- Se as migrations nao puderem preparar o schema antes da aplicacao servir requisicoes, a
  aplicacao deve falhar a inicializacao de forma controlada em vez de atender com schema
  incompleto.
- Reinicios sucessivos nao devem duplicar tarefas existentes.
- Falhas ao salvar ou ler tarefas devem retornar erro padronizado sem expor detalhes
  sensiveis do ambiente.
- Datas e status ja gravados devem manter o mesmo significado apos serem recuperados.
- Operacoes concorrentes simples sobre tarefas diferentes nao devem corromper dados ja
  confirmados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter tarefas criadas, atualizadas, concluidas e removidas
  de forma duravel entre reinicios da aplicacao.
- **FR-002**: O sistema MUST preservar os contratos existentes de criacao, listagem,
  busca, atualizacao, conclusao e remocao de tarefas, sem alterar endpoints, metodos HTTP,
  parametros, payloads, codigos de status ou formato de erros.
- **FR-003**: O sistema MUST preservar todos os atributos definidos para uma tarefa:
  `id`, `title`, `description`, `priority`, `status`, `createdAt` e `updatedAt`.
- **FR-004**: O sistema MUST garantir que uma tarefa removida nao reapareca apos reinicio.
- **FR-005**: O sistema MUST iniciar com uma colecao vazia quando ainda nao existir dado
  local previo.
- **FR-006**: O sistema MUST manter a persistencia atras da porta de repositorio, sem
  acesso direto a armazenamento em controllers HTTP ou casos de uso.
- **FR-007**: O sistema MUST permitir que os casos de uso continuem testaveis sem depender
  de armazenamento duravel real.
- **FR-008**: O sistema MUST expor falhas de persistencia por meio do formato padronizado
  de erro do projeto.
- **FR-009**: O sistema MUST manter a mesma semantica de filtros e ordenacao por
  prioridade ja definida para a listagem de tarefas.
- **FR-010**: O sistema MUST documentar no planejamento a escolha tecnica de armazenamento
  local e biblioteca de acesso solicitada para a implementacao.
- **FR-011**: O sistema MUST suportar a ausencia inicial do arquivo SQLite local e MUST
  preparar o schema por migrations antes de servir qualquer requisicao.
- **FR-012**: Controllers HTTP MUST NOT acessar Knex, SQLite, conexoes de banco, queries ou
  adaptadores de persistencia diretamente; eles MUST chamar apenas os casos de uso da
  aplicacao.

### Constitutional Requirements *(mandatory when applicable)*

- **HTTP Inputs**: Nao ha novas entradas HTTP; as entradas existentes continuam validadas
  com Zod antes de chegar aos casos de uso.
- **HTTP Contract**: A feature MUST NOT alterar o contrato da API existente, incluindo
  rotas, metodos, parametros, payloads, codigos de status e formato padronizado de erros.
- **Entity IDs**: Nao ha nova entidade; tarefas continuam usando UUID v4 definido pela
  feature TODO existente.
- **Error Cases**: Falhas de leitura, gravacao, preparacao do armazenamento e tarefa nao
  encontrada MUST usar o formato padronizado `{ code, message, details? }`.
- **Automated Tests**: A feature MUST cobrir testes de integracao para durabilidade entre
  reinicios, preservacao dos contratos HTTP existentes e isolamento da persistencia atras
  da porta de repositorio.
- **Controller Boundaries**: Controllers HTTP MUST permanecer finos e nao podem acessar
  Knex, SQLite ou qualquer detalhe direto de persistencia; todo acesso a tarefas passa
  pelos casos de uso e pela porta de repositorio.

### Key Entities

- **Tarefa**: Item de trabalho ja definido pela API TODO, que agora precisa sobreviver a
  reinicios com todos os seus atributos e estado mais recente.
- **Repositorio de Tarefas**: Porta de acesso a tarefas usada pelos casos de uso, com uma
  implementacao duravel substituindo o armazenamento volatil sem mudar o nucleo da
  aplicacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das tarefas criadas antes de um reinicio aparecem na listagem depois
  que a aplicacao volta a executar.
- **SC-002**: 100% das atualizacoes, conclusoes e remocoes confirmadas antes de um
  reinicio permanecem refletidas depois do reinicio.
- **SC-003**: 100% dos cenarios de contrato da API TODO existente continuam passando sem
  alterar endpoints, metodos HTTP, parametros, payloads, codigos de status ou formato de
  erros.
- **SC-004**: Casos de uso de tarefas continuam testaveis com repositorios substitutos em
  100% dos testes unitarios existentes.
- **SC-005**: Falhas esperadas de persistencia retornam erro padronizado em 100% dos
  cenarios cobertos por teste, sem expor detalhes sensiveis do ambiente.
- **SC-006**: Em 100% das inicializacoes sem arquivo local previo cobertas por teste, a
  aplicacao prepara o armazenamento antes de aceitar requisicoes e inicia com uma colecao
  vazia.

## Assumptions

- A feature complementa a API TODO existente e nao adiciona novos endpoints.
- A persistencia local atende uma unica instancia da aplicacao em ambiente de estudo ou
  desenvolvimento.
- Migracao de dados previamente mantidos apenas em memoria fica fora do escopo, pois esses
  dados nao existem apos encerramento do processo.
- Autenticacao, autorizacao, multiusuario, sincronizacao remota e backup ficam fora do
  escopo desta feature.
- A selecao tecnica informada pelo solicitante sera detalhada no plano, mantendo a spec
  focada no comportamento esperado.
