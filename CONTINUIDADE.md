# CONTINUIDADE — Leia isto primeiro

Você é a IA que assume a construção da **Bitna Saju** — empresa de relatórios de autoconhecimento baseados no Saju (Quatro Pilares, tradição coreana), vendidos online para o público brasileiro. Este documento transfere todo o contexto da sessão anterior (Claude Fable 5, jul/2026). O dono do projeto é o **Ivã** (trate no masculino; ele é leigo em programação — explique comandos passo a passo, PowerShell no Windows).

## Ordem de leitura obrigatória

0. `PROTOCOLO_DE_SESSAO.md` — as regras de trabalho de TODA sessão (abertura, registro de decisões, checklist de saída, commits). Não é opcional.
1. Este arquivo inteiro.
2. `empresa/EMPRESA.md` → `empresa/GUIA_DE_VOZ.md` → `empresa/DECISOES.md` (TODAS as decisões, D1 em diante — o número cresce a cada sessão) → `empresa/PESQUISA_MERCADO.md`
3. `relatorios/prompts/` (os 3 system prompts — ativos centrais)
4. O README.md de cada pasta antes de mexer nela.

## O que já está PRONTO (não refazer)

**Motor de cálculo** (`fortuneteller/`): fork do saju-mcp-server (MIT) com adaptações nossas — nascimentos no Brasil (74 cidades, timezone IANA com horário de verão histórico, correção de longitude; `src/data/brazil_cities.ts` + `src/utils/date.ts`), i18n completo pt-BR (`src/data/i18n/pt_br.ts`). Compilar: `npm install && npm run build`. SEMPRE rodar com `TZ=Asia/Seoul` (o server.mjs já define sozinho). Testes validados: DST, 4 fusos, fronteiras de pilar, regressão coreana.

**Backend** (`app/server.mjs`): rotas /leitura, /sinastria (4 tipos de relação), /diaria, /cidades, /pdf. UI de teste em `app/public/`. Fluxo de produção: motor calcula JSON → prompt → LLM escreve → revisão humana → PDF → e-mail.

**Prompts dos relatórios** (`relatorios/prompts/`): voz aprovada (mulher madura, vivida e acolhedora; honestidade acolhedora; estrutura V3 com frases fixas da casa). O relatório-padrão de qualidade é `relatorios/exemplos/relatorio_iva_premium_demonstracao.md`.

**Dois produtos prontos DE PONTA A PONTA**: Leitura Essencial (R$ 47, `app/pdf/gerar_pdf.py`, identidade própria — D21; escopo a enxugar, D26) e Leitura Completa (R$ 97 — nome comercial, renomeada de "Premium", id técnico segue `premium`; `app/pdf/premium_v5/build_pdf.py`, visual "livro de Seul" parametrizado — D14–D19). Ambos: cálculo + texto + PDF testados com dados reais. As duas Sinastrias já têm PDF entregável (D34, `app/pdf/sinastria/build_sinastria.py`). As Jornadas Bitna (bundle) agora são construíveis — falta só o empacotamento (D29).

## REGRAS INVIOLÁVEIS (a identidade da empresa)

1. **Concordância de gênero** pelo campo `sexo` em TODO texto gerado — revisar cada adjetivo/particípio. Foi falha real de concorrente que revoltou o dono; é a regra nº 1 de todos os prompts.
2. **Fidelidade ao JSON do motor** — nenhum relatório afirma o que não está calculado. Campo ausente = assunto ausente.
3. **Slogan**: "Não é sobre prever sua vida — é sobre entender seus padrões para decidir melhor." + 4 frases-síntese fixas (ver GUIA_DE_VOZ).
4. **Anti-misticismo**: proibido destino escrito, energia cósmica, universo conspira, galáxias/mandalas/tarô/cristais no visual. Saju sempre com orgulho da origem coreana, vocabulário comportamental.
5. **Disclaimer padrão** no fim de todo relatório + tendência (nunca previsão absoluta) + nunca aconselhar começar/terminar relações ou decisões médicas/financeiras.
6. Toda decisão nova → registrar em `empresa/DECISOES.md` com número sequencial.

## TAREFA Nº 1 — CONCLUÍDA (19/07/2026, sessão Claude Fable 5 / Claude Sonnet 5 Cowork)

**Parametrização do gerador de PDF v5** (`app/pdf/premium_v5/build_pdf.py`) feita: agora recebe `python build_pdf.py entrada.json saida.pdf` (mesma interface do v4) e está ligado no endpoint `/pdf` do `server.mjs` (só para `produto === 'premium'` — o essencial continua no v4, ver pendência 1 abaixo). Capítulos narrativos fluem a partir de `dados['relatorio']` (parse de `##`/`###`) com paginação automática de verdade (quebra até no meio de um parágrafo); "Resumo de bolso" e nota final são extraídos do relatório com fallback 100% no JSON do motor; pilares/ciclos continuam data-driven (nunca da prosa do LLM); hanja trocado de CID não-incorporada para TTF embutida (`malgun.ttf`/Droid/Noto, com degradação graciosa se nenhuma existir); reincluídos a frase de reanálise + selo vermelho na última página; título de capítulo nunca vaza a margem (encolhe e cai pra 2 linhas se precisar). Testado com o mapa real do Ivã, um mapa sintético adversarial (hora desconhecida, outro Mestre do Dia, título de capítulo gigante, sem relatório) e fim-a-fim via `/pdf` com o motor real. Detalhes completos em DECISOES.md → D14.

**Limite conhecido, não bloqueante**: se o LLM escrever termos coreanos em **hangul** solto na prosa (ex.: 십성), a fonte precisa ter cobertura de hangul, não só hanja — `malgun.ttf` no Windows cobre os dois; no Linux de teste deste sandbox só havia hanja disponível (Noto Serif/Sans CJK aqui são CFF, que o reportlab não lê — caiu pro Droid, hanja-only). Como D12 já pede hanja nos visuais e não hangul, isso não deveria aparecer na prática, mas fica registrado.

## Auditoria de coerência de produtos (03/08/2026 — D25–D29)

Feita a auditoria oferta vs. entrega (`empresa/AUDITORIA_COERENCIA_PRODUTOS.md`). Portfólio travado com nomes/preços/páginas: 🌿 **Leitura Essencial** R$47 · ⭐ **Leitura Completa** R$97 (renomeada de "Premium"; id técnico segue `premium`) · 💞 **Sinastria Amorosa** R$97 · 🤝 **Sinastria Profissional** R$97 · 🌸 **Jornadas Bitna** R$249 (bundle novo). Ver EMPRESA.md v1.2 e D27. Três achados que viraram trabalho pendente (abaixo): Essencial sobredimensionado, Sinastria sem PDF, páginas anunciadas ajustadas à realidade.

## [D35 — EM ANDAMENTO] Correções da Sinastria (revisão do Ivã, 04/08/2026)

Ivã revisou as amostras v2 e pediu um lote grande de ajustes. **Só o começo foi feito** (helpers de nome de arquivo `Tipo_Dupla_V3_Ano` tipo `Amorosa_IvãMRS&HelenaRC_V3_2026`, e `DOC_VERSION`/`ANO_DOC` em `build_sinastria.py`). As amostras v2 (10 páginas) seguem válidas. **Falta implementar (checklist):**
1. **Capa no padrão do Essencial:** eyebrow "EDIÇÃO SINASTRIA · V3 · 2026"; a PERGUNTA vira o título gigante ("Como funciona a relação/parceria de vocês?"), o nome do produto ("Sinastria Amorosa/Profissional") pequeno; abandonar "Saju de Casal"/"Sociedade e Parcerias". Hoje a capa repete "Sinastria Amorosa" 2×.
2. **Nome completo** do cliente sempre; nos cartões da p. "quem é cada um", incluir nascimento com **cidade-UF** ("Salvador - BA"). (JSON de sinastria precisa de `nascimento.uf` por pessoa — server já preenche via `montarLeitura`; nas amostras injetar BA/SP/DF/PR.)
3. **Fonte do corpo +1** (hoje 12,5 → 13,5).
4. **Rodapé com fundo preto**: logo bem pequena OU o site + as **iniciais dos clientes** (ex.: "BITNASAJU.COM.BR · IMRS & HRC").
5. **Página "Antes de ler"** (como no Essencial) — falta nas sinastrias; para o casal, usar a moldura "toda relação cria uma terceira identidade — nem você, nem a outra pessoa, mas o que nasce quando os dois caminham juntos" + o que é o gunghap.
6. **Ideograma do gunghap** na p. do corpo: "gunghap (宮合)" — hoje o parêntese sai vazio (hangul 궁합 é removido no Linux). Corrigir nos relatórios E no prompt `sinastria.md`.
7. **Termômetro em FAIXAS, não número** (crítica forte — "brasileiro ama nota, vira passei/reprovei"): 🟢 Harmonia Natural · 🟡 Harmonia Consciente · 🔵 Relação de Crescimento · 🟠 Complementaridade Desafiadora. Mapear por score, destacar a faixa atual, remover/minimizar o "51/100".
8. **Frase na p. "quem é cada um":** "Antes de entender a relação, precisamos conhecer quem cada um é."
9. **Página de OFERTA como última página** (padrão upsell do Essencial): oferecer a Jornada Bitna (Amorosa/Profissional) + demais leituras.
10. **Emoção nos textos:** reescrever trechos "X ama pela firmeza" em prosa mais viva ("Ivã não diz 'eu te amo' com facilidade. Ele prefere demonstrar ficando. Resolvendo. Voltando..."). Fixar no prompt.
11. **Resumo de bolso + "Primeiros três acordos"** (profissional: quem decide o quê, como discordar, como revisar; amorosa: análogo).
12. **Abandonar linguagem de "compatibilidade" → "compreensão"** no PDF e na oferta (posicionamento: a Bitna vende compreensão/decisões práticas, não veredito de compatibilidade). Ajustar wording e registrar em EMPRESA.
13. **[propor] Páginas type-specific que o Ivã elogiou muito** (avaliar/rediscutir): profissional → página "Quando essa parceria dá o seu melhor" (fluxo visual criar→estruturar→validar→executar→revisar) + gráfico emocional de barras (Visão/Execução/Comunicação/Risco). São type-specific, precisam de definição de eixos/valores — confirmar com o Ivã antes.

Insight estratégico do Ivã a preservar: **"o diferencial da Bitna não é o Saju — é transformar uma tradição coreana em decisões práticas / traduzir padrões em conversas."** A Profissional "parece ferramenta de gestão" — potencial de vender para empresas/B2B.

## Demais pendências (ordem sugerida)

1. ~~**[D28] Construir o gerador de PDF de Sinastria**~~ — ✅ **CONCLUÍDO (04/08/2026, D34).** `app/pdf/sinastria/build_sinastria.py`: 1 gerador, 2 produtos por tema (`tipoRelacao`) — Seal Red amorosa / Matte Bronze profissional. 10 páginas com 2 diagramas (ciclo dos 5 elementos + "o que um traz ao outro") e orientação individual a cada pessoa (D33). Testado com 2 pares reais → amostras `relatorios/exemplos/sinastria_*_AMOSTRA_v2.pdf`. Pendências menores: rota `/pdf-sinastria` no `server.mjs`, paletas formais, apagar amostras v1. **Destrava as Jornadas Bitna (D29), agora construíveis.**
2. ~~**[D26] Enxugar a Leitura Essencial**~~ + ~~**[D30] 9 correções de padrão do PDF**~~ — ✅ **CONCLUÍDOS (03/08/2026).** D26: prompt 12→8 seções, foco "Quem sou eu?", página de elementos premium-only, → 9 páginas (era 11). D30: nome completo + "Cidade - UF" na capa, logo aprovada na capa/fecho, fonte +1, eyebrow com versão (V3), página final com diferenciais da Completa, "Saju Brasil"→"Bitna Saju", ideograma 四柱 na abertura, adendos elementais no Faça mais/Evite, nome de arquivo `Tipo_Iniciais_V_Ano`. Tocou `gerar_pdf.py`, `server.mjs` (uf + nome de arquivo) e `leitura_individual.md`. Refinado em **D31** (nome de arquivo primeiro+último nome completo → `Essencial_IvaMRSantos_V3_2026`, fonte +1 só no texto corrido preservando títulos, logo maior na capa, cards da p.3 alargados, "www." no site, tópicos da p.9 dobrados). Refinado ainda em **D32** (título nunca fecha página via `keepWithNext`; tópicos da p.9 reequilibrados; rótulo "Mestre do Dia do seu nascimento" na p.7). Amostra canônica: `relatorios/exemplos/Essencial_IvaMRSantos_V3_2026.pdf`. Ver D26, D30, D31 e D32.
3. **[D29] Empacotar as Jornadas Bitna** — formulário multi-pessoa (2–3 pessoas numa compra) + entrega dos 3 PDFs juntos. Depende de D28.
4. **[D27] Propagar "Leitura Completa"** nos materiais de cliente (site/checkout/e-mail). Id técnico `premium` no código permanece.
5. Sinastria — paleta própria e DIRECAO_DE_ARTE (parte do D28).
6. Pré-lançamento: política de reembolso, LGPD/consentimento no formulário, transparência de IA, meta de validação (ver Pendências em DECISOES.md).
7. Expandir cidades para base IBGE completa; sorte diária como conteúdo de Instagram.

## Como gerar um relatório hoje (fluxo completo)

```
cd fortuneteller && npm install && npm run build && cd ..
node app/server.mjs          # abre http://localhost:3333
# Windows: pip install reportlab pypdf  (para o PDF)
```
Na UI: aba Leitura → dados + produto → gerar. Sem ANTHROPIC_API_KEY o texto narrativo não sai (aparece o prompt pronto — pode ser colado em qualquer Claude); com a chave, sai automático.

## Estilo de colaboração com o Ivã

Ele decide, você executa e critica com franqueza — ele gosta de discutir antes de executar mudanças grandes e de registrar decisões. Sempre: commits com mensagens claras ao fim de cada rodada (ele roda git no PowerShell — lembre que `&&` não funciona lá; comandos em linhas separadas). ENTREGUE o bloco de commit pronto para copiar, com a mensagem já escrita entre aspas — sem isso os commits saem com mensagens vazias tipo "0" (já aconteceu 3×). Apresente arquivos criados. Não gaste tokens dele com verificações visuais desnecessárias — ele mesmo revisa os PDFs e traz feedback.
