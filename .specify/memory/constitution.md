<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Added principles:
  - I. TypeScript Obrigatorio
  - II. Validacao HTTP com Zod
  - III. Arquitetura Hexagonal
  - IV. Regras de Negocio Fora de Controllers
  - V. Testes Automatizados por Feature
  - VI. Simplicidade para Estudo
  - VII. IDs com UUID v4
  - VIII. Erros Padronizados
  - IX. Spec, Plan e Tasks Antes da Implementacao
- Added sections:
  - Restricoes Tecnicas
  - Fluxo de Desenvolvimento
- Removed sections: none
- Templates requiring updates:
  - updated: .specify/templates/plan-template.md
  - updated: .specify/templates/spec-template.md
  - updated: .specify/templates/tasks-template.md
  - verified: .specify/templates/commands/ (directory not present)
- Follow-up TODOs: none
-->
# SDD Todo Constitution

## Core Principles

### I. TypeScript Obrigatorio
Todo codigo da aplicacao MUST ser desenvolvido em TypeScript. Configuracoes e artefatos
auxiliares MAY usar outros formatos quando exigidos pela ferramenta, mas a logica da
aplicacao MUST permanecer em TypeScript. Isso mantem a base consistente e adequada para
estudo.

### II. Validacao HTTP com Zod
Toda entrada recebida por HTTP MUST ser validada com Zod antes de chegar aos casos de uso.
Isso inclui body, query params, route params e headers usados pela feature. Dados invalidos
MUST produzir um erro padronizado e nao podem alcancar regras de negocio.

### III. Arquitetura Hexagonal
A aplicacao MUST separar responsabilidades segundo a arquitetura hexagonal. Regras de
negocio e casos de uso MUST permanecer no nucleo da aplicacao; adaptadores HTTP,
persistencia e integracoes externas MUST depender das portas definidas pelo nucleo.

### IV. Regras de Negocio Fora de Controllers
Controllers MUST limitar-se a receber dados validados, chamar casos de uso e traduzir a
resposta para HTTP. Decisoes de negocio, orquestracao de dominio e acesso direto a
persistencia MUST NOT ficar em controllers.

### V. Testes Automatizados por Feature
Toda feature MUST incluir testes automatizados proporcionais ao comportamento entregue.
Casos de uso e regras de negocio MUST ter testes unitarios; contratos HTTP e integracoes
relevantes MUST ter testes quando fizerem parte da feature. Uma feature nao esta concluida
enquanto seus testes nao passarem.

### VI. Simplicidade para Estudo
O codigo MUST priorizar clareza, nomes explicitos e solucoes diretas. Abstracoes MUST
resolver uma necessidade concreta ou preservar os limites arquiteturais. Complexidade
adicional MUST ser justificada no plano quando uma alternativa simples nao for suficiente.

### VII. IDs com UUID v4
Novos identificadores de entidades MUST ser gerados como UUID v4. A geracao MUST ocorrer
em um ponto testavel do nucleo ou por uma porta injetavel quando o caso de uso exigir
controle deterministico em testes.

### VIII. Erros Padronizados
Erros expostos pela aplicacao MUST seguir um formato unico documentado pelo projeto. Cada
erro MUST fornecer ao menos um codigo estavel, uma mensagem legivel e os detalhes
necessarios para diagnostico quando aplicavel, sem expor informacoes sensiveis.

### IX. Spec, Plan e Tasks Antes da Implementacao
Nenhuma implementacao MUST comecar antes da existencia de `spec.md`, `plan.md` e
`tasks.md` para a feature. Mudancas de escopo MUST atualizar esses artefatos antes da
alteracao correspondente no codigo.

## Restricoes Tecnicas

- TypeScript e a linguagem obrigatoria para o codigo da aplicacao.
- Zod e obrigatorio em toda fronteira HTTP.
- A estrutura de codigo MUST evidenciar dominio, aplicacao, portas e adaptadores.
- Endpoints que criam entidades MUST usar UUID v4.
- Contratos HTTP MUST documentar o formato padronizado de erros.

## Fluxo de Desenvolvimento

1. Criar ou atualizar a especificacao da feature.
2. Produzir o plano e verificar todos os gates constitucionais.
3. Gerar tasks rastreaveis para cada historia, incluindo testes automatizados.
4. Implementar somente depois de `spec.md`, `plan.md` e `tasks.md` existirem.
5. Executar os testes da feature antes de considera-la concluida.
6. Justificar no plano qualquer complexidade que exceda a solucao direta.

## Governance

Esta constituicao prevalece sobre praticas conflitantes do projeto. Emendas MUST atualizar
este documento, registrar o impacto nos templates dependentes e usar versionamento
semantico: MAJOR para remocoes ou redefinicoes incompativeis de principios, MINOR para
novos principios ou expansoes materiais e PATCH para esclarecimentos sem mudanca de
governanca. Toda revisao de spec, plan, tasks ou implementacao MUST verificar conformidade
com os principios acima. Excecoes MUST ser justificadas no plano e aprovadas explicitamente
antes da implementacao.

**Version**: 1.0.0 | **Ratified**: 2026-06-01 | **Last Amended**: 2026-06-01
