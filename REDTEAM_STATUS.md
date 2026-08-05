# Status das correções do red team (loop OODA)

Branch: `redteam-fixes`. Nada foi mergeado na main nem publicado.

## Item 1 — Cálculo à prova de fuso + horário de verão — ✅ FECHADO, sem bug

**Investigação completa.** A hipótese inicial (bug real no pilar do Dia para nascimentos dentro das janelas de horário de verão coreano, 1948–60/1987–88) **não se confirmou**. Era um problema de ambiente nesta máquina Windows/Git Bash, não do motor:

1. `TZ=Asia/Seoul` (exigido pelo motor, ver `app/server.mjs`) não chegava aos testes por 3 motivos empilhados: prefixo de shell não propaga pro Node aqui, `export` também não, e um `process.env.TZ` dentro do arquivo de teste roda tarde demais (imports ESM são hoisted).
2. Uma primeira correção (`setupFiles` do Jest) resolveu a variável de ambiente, mas não o problema real: o V8 já tinha cacheado o fuso do sistema na primeira chamada a `Date`/`Intl` feita pelo próprio bootstrap do Jest, antes do `setupFiles` rodar.
3. Fix definitivo: `process.env.TZ = 'Asia/Seoul'` no topo do próprio `fortuneteller/jest.config.js` — roda no processo principal do Jest antes de criar os workers, que herdam a variável já correta desde o nascimento do processo.

Com o TZ genuinamente correto, **as 133 verificações da suíte de testes passam, incluindo os dois oráculos verificados externamente (Ivã e Fagundes, 100% dos pilares)**. Motor de cálculo confirmado correto para fuso/horário de verão brasileiro (IANA via `date-fns-tz`) e para a re-ancoragem em horário de verão coreano histórico.

**Entregue**: `fortuneteller/tests/redteam-oracles.test.ts` (oráculos Ivã/Fagundes + regressão de DST brasileiro jan/1990) + fix de `jest.config.js`. Commits `3ed970c` e `d6e84db`.

## Item 5 — Convenção de hora + "hora desconhecida" — ⏳ PENDENTE DECISÃO

Confirmado: hoje só existe o caminho "hora solar verdadeira" (correção de longitude) para cidades brasileiras — não é configurável, e não existe caminho "hora do relógio" alternativo nem tratamento de "hora desconhecida". Aguardando decisão de metodologia antes de implementar.

## Itens 2, 3, 4, 6, 8 — ainda não iniciados

Aguardando ordem de prioridade.
