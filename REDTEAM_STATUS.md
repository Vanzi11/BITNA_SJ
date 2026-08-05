# Status das correções do red team (loop OODA)

Branch: `redteam-fixes`. Nada foi mergeado na main nem publicado.

## Item 1 — Cálculo à prova de fuso + horário de verão — ✅ FECHADO, sem bug

**Investigação completa.** A hipótese inicial (bug real no pilar do Dia para nascimentos dentro das janelas de horário de verão coreano, 1948–60/1987–88) **não se confirmou**. Era um problema de ambiente nesta máquina Windows/Git Bash, não do motor:

1. `TZ=Asia/Seoul` (exigido pelo motor, ver `app/server.mjs`) não chegava aos testes por 3 motivos empilhados: prefixo de shell não propaga pro Node aqui, `export` também não, e um `process.env.TZ` dentro do arquivo de teste roda tarde demais (imports ESM são hoisted).
2. Uma primeira correção (`setupFiles` do Jest) resolveu a variável de ambiente, mas não o problema real: o V8 já tinha cacheado o fuso do sistema na primeira chamada a `Date`/`Intl` feita pelo próprio bootstrap do Jest, antes do `setupFiles` rodar.
3. Fix definitivo: `process.env.TZ = 'Asia/Seoul'` no topo do próprio `fortuneteller/jest.config.js` — roda no processo principal do Jest antes de criar os workers, que herdam a variável já correta desde o nascimento do processo.

Com o TZ genuinamente correto, **as 133 verificações da suíte de testes passam, incluindo os dois oráculos verificados externamente (Ivã e Fagundes, 100% dos pilares)**. Motor de cálculo confirmado correto para fuso/horário de verão brasileiro (IANA via `date-fns-tz`) e para a re-ancoragem em horário de verão coreano histórico.

**Entregue**: `fortuneteller/tests/redteam-oracles.test.ts` (oráculos Ivã/Fagundes + regressão de DST brasileiro jan/1990) + fix de `jest.config.js`. Commits `3ed970c` e `d6e84db`.

## Item 2 — Terceiros no relatório (nome completo no PDF de Sinastria) — ✅ FEITO (parcial — falta consentimento no formulário)

`app/pdf/sinastria/build_sinastria.py`: a capa (`pagina_capa`) e o cartão-identidade de cada pessoa (`card_pessoa`) mostravam o nome completo das duas pessoas — trocado por iniciais (`_iniciais_curtas`, já existia e já era usado no rodapé). O nome completo continua existindo só no JSON de entrada em memória durante a geração — hoje não é persistido em disco pelo `server.mjs` (não existe rota `/pdf-sinastria` ainda; quando for criada, replicar o padrão do `/pdf` — grava em `tmpdir()` e apaga logo depois com `unlinkSync`).

A prosa do relatório (texto do LLM) continua endereçando cada pessoa só pelo primeiro nome — já era assim (padrão D19), não é nome completo, mantido.

**Pendente, não é código**: o checkbox de consentimento da segunda pessoa no formulário de coleta de dados. Hoje a coleta é manual por e-mail (`docs/FASE4B`), não um formulário web — quando o formulário automático da Fase 5 existir, incluir esse consentimento. Registrado aqui, não em código ainda.

## Item 3 — Disclaimers nas sinastrias — ✅ FEITO (rascunho — pendente revisão jurídica)

As duas sinastrias já tinham uma página "NOTA" (`pagina_nota`) com um texto fixo — só que puramente filosófico, sem a cláusula de segurança que o Essencial já tem (`app/pdf/gerar_pdf.py`: "não substitui acompanhamento médico ou psicológico..."). Estendido o texto já aprovado (não reescrito do zero) pra incluir médico/psicológico/jurídico/financeiro + "nenhum mapa determina... uma decisão de negócio" (cobre a Profissional), em dois lugares que precisam ficar sincronizados:
- `relatorios/prompts/sinastria.md` (item 11, o que o LLM deve escrever)
- `app/pdf/sinastria/build_sinastria.py` (`pagina_nota`, o texto de fallback se o LLM não escrever)

**Igual ao item 2**: revisão de advogado antes de publicar, mesma ressalva já registrada em `empresa/textos/LANCAMENTO_MANUAL_TEXTOS.md` pra política de reembolso.

## Item 8 — Logo/assets — ⏸️ BLOQUEADO, falta arquivo-fonte

Confirmado: não existe nenhum arquivo vetorial do logo (SVG, AI, EPS) em lugar nenhum do repositório — só PNGs já renderizados em `empresa/marca/logo/`. Não dá pra "vetorizar" o glifo 빛나 sem o arquivo de origem (provavelmente Figma, de onde saiu o Brandbook V2). A fragilidade real existe: `Site/bitna-saju-index.html` tem um SVG com `<text>빛나</text>` como texto vivo (fonte do sistema), que quebra em dispositivo sem fonte coreana instalada — mas os PDFs de produto usam os PNGs já prontos, não têm esse problema.

**Ação necessária, não é código**: Ivã precisa enviar o arquivo de origem do logo (com curvas/paths reais) pra alguém converter texto→path.

**SSL/www**: confirmado que não existe `.htaccess` nem qualquer config de servidor versionada no repositório — é 100% fora do escopo de código, fica pendente direto com o Ivã (cPanel).

## Item 5 — Convenção de hora + "hora desconhecida" — 🟡 ESTRUTURA PRONTA, falta decisão de padrão

**"Hora desconhecida" já estava implementado** (não sabia disso quando escrevi a primeira versão desta seção) — `app/server.mjs`, função `montarLeitura` (usada tanto por `/leitura` quanto por `/sinastria`, para qualquer uma das duas pessoas): usa meio-dia só como placeholder técnico pro cálculo, mas deleta o pilar da Hora do resultado (`delete leitura.pilares.hora`) e marca `horaDesconhecida: true` + `nascimento.hora = 'desconhecida'`. Nunca inventa hora nem finge precisão que não tem.

**Estrutura de convenção de hora, construída agora**: `calculateSaju()` ganhou um 7º parâmetro opcional `OpcoesCalculoSaju` (retrocompatível — sem passar, nada muda):
- `horaConvencao: 'solar' | 'relogio'` — solar é o padrão atual (correção de longitude); relógio pula essa correção, usa só a hora civil com horário de verão histórico já aplicado.
- `diaMudaAs23h: boolean` — convenção "zi cedo" (早子時): nascimentos às 23h+ usam o pilar do Dia do dia seguinte. Padrão `false` (comportamento atual).

Testado contra a coluna do oráculo do Fagundes que eu não conseguia verificar antes (hora do relógio = 戊寅) — bateu certo depois de corrigir um bug no primeiro rascunho (detalhes no commit `c4ab77c`). 137/137 testes passam, nenhuma mudança no comportamento padrão.

**Decisão que falta**: qual convenção vira o padrão de fato (`solar`, `relogio`, ou `diaMudaAs23h` ligado) — ou se cada uma fica disponível como opção no formulário, sem um "padrão da casa". Ver missão original, item 5.

## Item 4 — Diferenciar a Sinastria Profissional — não iniciado

## Item 6 — Sistema de faixas honesto — ⏳ PENDENTE DECISÃO

Não iniciado — precisa da proposta de limiares/distribuição antes de aplicar (ver missão original).
