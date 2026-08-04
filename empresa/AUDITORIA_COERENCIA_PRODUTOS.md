# Auditoria de Coerência de Produtos — Oferta vs. Entrega

> Data: 03/08/2026 · Sessão Ivã + Claude (Opus) · Registra as decisões D25–D29 (ver `DECISOES.md`).
> Objetivo: cruzar cada oferta comercial (copy final aprovada pelo Ivã, com preços e páginas) com o que o motor/prompt/gerador realmente entrega hoje, e decidir onde **aplicar** ou **reduzir** escopo.

## Método

Para cada produto foram comparados três planos:
1. **Oferta** — a copy de venda (bullets, preço, prazo, número de páginas).
2. **Prompt** — o que o system prompt manda o LLM escrever (`relatorios/prompts/`).
3. **Amostra real** — o PDF gerado de ponta a ponta (`relatorios/exemplos/`), incluindo contagem de páginas medida.

## Quadro-resumo

| Produto | Preço oferta | Páginas na oferta | Páginas reais (amostra) | Coerência de conteúdo | Situação |
|---|---|---|---|---|---|
| 🌿 Leitura Essencial | R$ 47 | 8 | **11** (amostra v2, redesenho D21) | **Sobredimensionado** — entrega ciclos, 5 elementos e amor, que deveriam ser exclusivos da Completa | Reduzir escopo (D26) |
| ⭐ Leitura Completa | R$ 97 (de R$ 120) | 16 | **26–27** (amostras Fagundes, texto de produção) | Coerente / entrega a mais | Ajustar páginas + nome + preço (D25, D27) |
| 💖 Sinastria Amorosa | R$ 97 | 12–16 | **Nenhum PDF existe** (só prompt + exemplos .md) | Prompt cobre os bullets; falta o produto físico | Construir gerador de PDF (D28) |
| 🤝 Sinastria Profissional | R$ 97 | 12–16 | **Nenhum PDF existe** | Idem (mesmo SKU técnico, `tipoRelacao`) | Construir gerador de PDF (D28) |
| 🌸 Jornadas Bitna | R$ 249 (de R$ 291) | 3 relatórios | Produto novo — empacotamento | Viável; depende do PDF de Sinastria | Definir empacotamento (D29) |

## Diagnóstico produto a produto

### 🌿 Leitura Essencial — "Quem sou eu?"
A oferta promete três coisas: Elemento Mestre, talentos naturais e forma de pensar/agir/decidir. Mas o prompt (`leitura_individual.md`) hoje entrega 12 seções, incluindo **ciclos de década** (seção 5), **cinco elementos: excesso e ausência** (seção 4) e **amor e vínculos** (seção 7). A amostra real (`leitura_essencial_fagundes_1987_AMOSTRA_v2.pdf`) tem **11 páginas** — as 8 páginas da oferta eram a versão antiga (`leitura_simples`), anterior ao redesenho D21.

Problema central: o Essencial **canibaliza a Completa**. Ciclos e mapa dos cinco elementos são justamente o coração da Leitura Completa — se o produto de R$ 47 já os entrega, o cliente tem pouca razão para subir para o de R$ 97. **Decisão (D26): enxugar o Essencial** para focar em "Quem sou eu?" (personalidade, talentos, forma de decidir), removendo ciclos e o mapa dos cinco elementos, e aprofundando o núcleo do Mestre do Dia.

### ⭐ Leitura Completa — "Como minha vida funciona?"
Conteúdo **coerente** com os bullets: o prompt (`leitura_premium.md`) entrega os 4 pilares, mapa dos cinco elementos, ciclos completos, prosperidade, carreira, bloqueio central e plano de ação. A amostra de produção tem **26–27 páginas**, não as 16 anunciadas (as versões de 16–18 páginas eram anteriores às adições D14–D19). A contagem **varia com o mapa e o tamanho do texto** (16 a 27 páginas observadas entre versões; o gerador atual, para texto de produção, fica em ~26).

Três desalinhamentos de rótulo, todos herdados de decisões anteriores:
- **Nome:** a oferta chama de "Leitura Completa"; o repositório e o backend usam "Premium" / `produto: 'premium'`. Congelar "Leitura Completa" como nome comercial, mantendo `premium` como id técnico interno (D27).
- **Preço:** R$ 97 (de R$ 120) na oferta; cabeçalho do prompt e materiais ainda dizem R$ 197.
- **Páginas:** ajustar a oferta para a realidade (~26), conforme D25.

### 💞 Sinastria Amorosa & 🤝 Sinastria Profissional
O prompt (`sinastria.md`) cobre bem os quatro diferenciais anunciados de cada tipo (via `tipoRelacao`). **Mas não existe gerador de PDF de sinastria nem nenhuma amostra em PDF** — só exemplos em markdown. Estamos anunciando um PDF de 12–16 páginas que ainda não foi construído. Este é o maior gap técnico do portfólio, e ele **bloqueia três produtos**: as duas Sinastrias e as Jornadas Bitna.

Ajustes de rótulo: cabeçalho do prompt ainda diz "R$ 49,90 / bump Mapa Completo" (preço antigo D4); o produto foi renomeado de "Societária & Parcerias" para "Profissional". A estimativa de 12–16 páginas é plausível (900–1200 palavras na densidade visual da casa), mas **só se confirma depois de construir o gerador**.

### 🌸 Jornadas Bitna (produto novo)
Tecnicamente o mais simples: **não requer motor nem prompt novo**. É empacotamento de relatórios que já existem:
- **Jornada Amorosa** = 2 Leituras Completas + 1 Sinastria Amorosa
- **Jornada Profissional** = 2 Leituras Completas + 1 Sinastria Profissional

A matemática de preço fecha: 2 × R$ 97 + R$ 97 = R$ 291 de lista → R$ 249 no bundle (~15% de desconto). Viabilidade **alta**, com três dependências: (1) o PDF de Sinastria precisa existir (D28); (2) o formulário precisa coletar os dados de 2–3 pessoas numa compra só; (3) definir a entrega dos 3 PDFs juntos (e-mail único, ordem de leitura sugerida). Ver D29.

## Caminho de implementação (ordem sugerida)

1. **Construir o gerador de PDF de Sinastria** — destrava 3 produtos (as 2 Sinastrias + Jornadas). Maior prioridade técnica. Reaproveitar a arquitetura de `premium_v5/build_pdf.py`; paleta própria já intencionada em D11 (selo vermelho amorosa / dourado profissional).
2. **Enxugar o Essencial** (D26) — ajustar `leitura_individual.md` (remover seções de ciclos e cinco elementos, aprofundar o núcleo) e o gerador `gerar_pdf.py` (remover a página code-drawn de elementos), **testar com dado real** e confirmar a nova contagem de páginas antes de fechar o número na oferta.
3. **Sincronizar preços/nomes** em prompts, backend e materiais (parcialmente feito nesta sessão — ver D27).
4. **Definir empacotamento das Jornadas** (D29) — formulário multi-pessoa e fluxo de entrega.
5. **Paletas de Essencial e Sinastrias** — pendência aberta desde D24.
