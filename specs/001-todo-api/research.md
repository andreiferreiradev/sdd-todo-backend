# Research: Gerenciamento de Tarefas TODO

## Runtime

**Decision**: Usar Node.js 24 LTS.

**Rationale**: A linha 24 esta em LTS e e apropriada para aplicacoes. O projeto Node.js
recomenda linhas Active LTS ou Maintenance LTS para producao. A API tambem pode usar
`node:crypto.randomUUID()`, que gera UUID RFC 4122 versao 4 com gerador
pseudoaleatorio criptografico.

**Alternatives considered**:
- Node.js 26 Current: mais recente, mas nao e LTS.
- Node.js 22 LTS: suportado, mas a linha 24 e a LTS mais atual.

**Sources**:
- [Node.js releases](https://nodejs.org/en/about/previous-releases)
- [Node.js crypto.randomUUID](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)

## Language

**Decision**: Usar TypeScript 5.9 com verificacao estrita.

**Rationale**: TypeScript 5.9 e a versao documentada atual e seu `tsc --init` atualizado
inclui opcoes estritas adequadas para um projeto novo. A configuracao sera mantida curta e
explicita para facilitar estudo.

**Alternatives considered**:
- JavaScript: viola a constituicao.
- Configuracao TypeScript permissiva: reduz a clareza dos contratos internos.

**Source**:
- [TypeScript 5.9 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)

## HTTP Framework

**Decision**: Usar Fastify 5.

**Rationale**: Fastify oferece servidor HTTP pequeno, suporte a TypeScript e injecao HTTP
para testes sem abrir porta de rede. A aplicacao sera separada do entry point do servidor,
seguindo o padrao recomendado na documentacao de testes.

**Alternatives considered**:
- Servidor `node:http` manual: menos dependencias, mas exige mais infraestrutura HTTP
  incidental para rotas e tratamento de respostas.
- Express: viavel, mas Fastify oferece um caminho direto para testes HTTP com `inject()`.

**Sources**:
- [Fastify introduction](https://fastify.dev/docs/v5.7.x/)
- [Fastify testing guide](https://fastify.dev/docs/v5.7.x/Guides/Testing/)

## HTTP Validation

**Decision**: Usar Zod 4 em schemas dedicados na borda HTTP.

**Rationale**: A constituicao exige Zod. Zod 4 e estavel, orientado a TypeScript e permite
validar dados nao confiaveis antes de chama-los nos casos de uso. Schemas de objetos serao
estritos para rejeitar campos desconhecidos.

**Alternatives considered**:
- Validacao nativa do Fastify por JSON Schema: util, mas nao satisfaz a exigencia de Zod.
- Validacao dentro dos casos de uso: mistura transporte com regras da aplicacao.

**Sources**:
- [Zod documentation](https://zod.dev/)
- [Zod package documentation](https://zod.dev/packages/zod)

## Storage

**Decision**: Criar uma porta `TaskRepository` e um adaptador em memoria baseado em `Map`.

**Rationale**: A spec nao exige persistencia duravel. Um adaptador em memoria entrega o
fluxo completo com baixo custo cognitivo, enquanto a porta mantem a arquitetura preparada
para uma troca futura por banco sem alterar casos de uso.

**Alternatives considered**:
- SQLite ou PostgreSQL: adicionam migracoes e infraestrutura sem requisito funcional.
- Acesso a `Map` diretamente nos controllers: viola arquitetura hexagonal e dificulta testes.

## Time and IDs

**Decision**: Injetar portas pequenas `Clock` e `IdGenerator`; usar `Date` e
`node:crypto.randomUUID()` nos adaptadores padrao.

**Rationale**: IDs e timestamps permanecem simples em producao e deterministicos em testes.
Isso evita mocks globais e mantem a regra de UUID v4 verificavel.

**Alternatives considered**:
- Chamar relogio e UUID diretamente dentro de todos os casos de uso: funciona, mas torna
  testes menos claros.
- Biblioteca externa de UUID: desnecessaria porque Node.js fornece UUID v4 nativamente.

## Testing

**Decision**: Usar o test runner nativo do Node.js e `fastify.inject()`.

**Rationale**: O runner nativo reduz dependencias. `fastify.inject()` permite exercitar
contratos HTTP depois do bootstrap dos plugins sem iniciar uma porta real. Testes unitarios
usam adaptadores controlados para clock e IDs.

**Alternatives considered**:
- Vitest: bom runner, mas nao e necessario para este escopo.
- Testes somente HTTP: deixariam regras de negocio menos localizadas e mais lentas de
  diagnosticar.

**Source**:
- [Fastify testing guide](https://fastify.dev/docs/v5.7.x/Guides/Testing/)
