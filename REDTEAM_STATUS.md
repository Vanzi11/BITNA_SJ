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

## Item 8 — Logo/assets — ✅ FEITO

Confirmado: não existia nenhum arquivo vetorial do logo no repositório, só PNGs já renderizados. O Ivã enviou `gemini-svg.svg` (05/08/2026) com a estrutura/cores/grid do BrandBook — mas apesar do nome, o texto ainda estava vivo (`<text font-family="Didot, Bodoni MT...">`), dependente de fonte instalada, não vetorizado de verdade.

Convertido para curvas reais: baixadas as fontes de origem (Playfair Display 500 para BITNA, Inter 300 para SAJU, Noto Serif KR 700 para o selo 빛나 — via Google Fonts, decompactadas de WOFF2 para TTF com `fonttools`) e usado `opentype.js` pra extrair o contorno de cada glifo e montar `<path>` no lugar de `<text>`. Resultado: `empresa/marca/logo/logo_vetorizado.svg`, conferido visualmente (renderizado para PNG e inspecionado) — bateu certo com a estrutura do arquivo original, zero dependência de fonte no dispositivo que renderiza.

Bug pego no caminho: um `grep -B3` pegou a URL da fonte errada (subconjunto "latin-ext" em vez de "latin") na primeira tentativa, fazendo S/J/U de "SAJU" renderizarem como glifo `.notdef` — pego na conferência visual, corrigido antes de salvar o arquivo final.

**SSL/www**: confirmado que não existe `.htaccess` nem qualquer config de servidor versionada no repositório — é 100% fora do escopo de código, fica pendente direto com o Ivã (cPanel).

## Item 5 — Convenção de hora + "hora desconhecida" — ✅ FECHADO (D37)

**"Hora desconhecida" já estava implementado** (não sabia disso quando escrevi a primeira versão desta seção) — `app/server.mjs`, função `montarLeitura` (usada tanto por `/leitura` quanto por `/sinastria`, para qualquer uma das duas pessoas): usa meio-dia só como placeholder técnico pro cálculo, mas deleta o pilar da Hora do resultado (`delete leitura.pilares.hora`) e marca `horaDesconhecida: true` + `nascimento.hora = 'desconhecida'`. Nunca inventa hora nem finge precisão que não tem.

**Estrutura de convenção de hora, construída agora**: `calculateSaju()` ganhou um 7º parâmetro opcional `OpcoesCalculoSaju` (retrocompatível — sem passar, nada muda):
- `horaConvencao: 'solar' | 'relogio'` — solar é o padrão atual (correção de longitude); relógio pula essa correção, usa só a hora civil com horário de verão histórico já aplicado.
- `diaMudaAs23h: boolean` — convenção "zi cedo" (早子時): nascimentos às 23h+ usam o pilar do Dia do dia seguinte. Padrão `false` (comportamento atual).

Testado contra a coluna do oráculo do Fagundes que eu não conseguia verificar antes (hora do relógio = 戊寅) — bateu certo depois de corrigir um bug no primeiro rascunho (detalhes no commit `c4ab77c`). 137/137 testes passam, nenhuma mudança no comportamento padrão.

**Decisão tomada (D37, `empresa/DECISOES.md`)**: hora solar verdadeira continua como padrão único da casa — é exatamente o comportamento que já rodava antes desta rodada, agora formalizado. `relogio` e `diaMudaAs23h` ficam implementados e testados, mas não expostos como opção — reserva técnica.

## Item 6 — Sistema de faixas honesto — ✅ FECHADO (D38)

**Confirmado o que o red team suspeitava.** Script de validação criado (`fortuneteller/scripts/validar_distribuicao_faixas.mjs`, rodar com `node scripts/validar_distribuicao_faixas.mjs` depois de `npm run build`) — testou ~15 mil pares de mapas reais diversos contra os limiares originais (`app/pdf/sinastria/build_sinastria.py`: 46/62/78):

| Faixa | Antes (46/62/78) |
|---|---|
| Desafiadora | 4,9% |
| Crescimento | **74,7%** |
| Consciente | 20,2% |
| Natural | **0,3%** |

Três quartos de todos os pares caem em "Crescimento", e "Natural" praticamente não existe na prática — a faixa está no código, mas ninguém a alcança. Causa raiz: a fórmula de score em `fortuneteller/src/lib/compatibility.ts` usa uma base de 60 pontos com ajustes modestos (±10 a ±20) numa média ponderada de 4 sub-notas — estatisticamente isso converge pro meio, então os limiares (pensados como se a distribuição fosse uniforme 0-100) ficaram descalibrados pra distribuição real, que se concentra entre 47 e 65.

**Duas propostas simuladas** (no próprio script, sem aplicar nada):

| Esquema | Limiares | Desafiadora | Crescimento | Consciente | Natural |
|---|---|---|---|---|---|
| Quartis exatos | 51 / 56 / 61 | 20% | 27% | 27% | 25% |
| Meio-termo | 48 / 56 / 64 | 10% | 38% | 38% | 14% |

A correção mais simples é só recalibrar os limiares (baixo risco — não toca na fórmula de score, só em 2 números no `build_sinastria.py`). Uma correção mais funda seria redesenhar a própria fórmula pra distribuir melhor por conta própria (maior risco — mexe no significado do score em qualquer outro lugar que o leia) — não feita nesta rodada, fica registrada como possibilidade futura.

**Decisão (D38, `empresa/DECISOES.md`)**: mantidas as 4 faixas (o Ivã cogitou mais categorias, mas decidiu adiar essa ideia) e aplicado o esquema meio-termo — **novos limiares 48/56/64** em `faixa_relacao()`. Distribuição agora: Desafiadora ~10% · Crescimento ~38% · Consciente ~38% · Natural ~14%.

**Decisão que falta**: qual dos dois esquemas (ou um customizado) vira o padrão — e se vale a pena investir na correção mais funda da fórmula depois, ou se recalibrar os limiares já resolve o suficiente pra fase de validação atual.

## Item 4 — Diferenciar a Sinastria Profissional — ✅ FEITO (pendente amostra/revisão)

Amorosa e Profissional tinham a mesma estrutura de 11 seções, só trocando tom/rótulos — o red team apontou ~60-70% de sobreposição real. Os dados pra diferenciar de verdade **já existiam no motor**, sem precisar de nenhuma mudança de código: `pessoa1/pessoa2.dezDeuses.distribuicao` já traz as contagens de Riqueza Direta/Indireta (財) e Oficial Direto/Indireto (官) de cada mapa — só faltava o prompt (`relatorios/prompts/sinastria.md`) instruir o uso disso.

Adicionado: parágrafo explícito no "Foco por tipo de relação" comparando riqueza/autoridade entre as duas pessoas; 2 pontos novos na cobertura obrigatória (dinheiro/risco, autoridade/decisão), exclusivos da societaria; a seção 6 da estrutura virou "Dinheiro, risco e autoridade" na societaria (era conteúdo genérico) — a seção que a amorosa explicitamente não tem.

**Não gerei amostra nova pra conferir visualmente** — fica pro Ivã rodar o motor real e revisar como já faz com os outros PDFs (o texto é gerado pelo LLM a partir do prompt, não dá pra prever com certeza como vai sair sem rodar de verdade).
