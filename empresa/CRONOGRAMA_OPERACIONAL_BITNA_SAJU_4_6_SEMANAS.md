# Cronograma operacional BITNA SAJU — execução comercial em 4 a 6 semanas

**Responsável pela proposta:** Juliana Ops, sub-gerente operacional da Naia  
**Base:** projeto comercial V2 + estado real do repo  
**Premissa central:** vender, medir, entregar bem e aprender antes de automatizar ou escalar.

---

## 0. Premissas operacionais obrigatórias

- A BITNA é uma marca **faceless**: comunicação editorial, sem depender do Ivã como rosto público.
- Foco atual: **B2C**. B2B e Sinastria Profissional como frente corporativa ficam fora da prioridade imediata.
- Não criar novos produtos agora, com uma exceção já decidida: o **Guia Ilustrado do Saju** (ver seção 0.1, item 4).
- Produtos e preços comerciais de referência para esta execução:
  - Leitura Essencial: **R$ 47,60**.
  - Leitura Completa: **R$ 149,30**.
  - Sinastrias: **R$ 98,00**.
  - Guia Ilustrado do Saju: **R$ 9,80** como order bump.
  - Jornadas: **2 Completas + 1 Sinastria**, valor cheio dos componentes **R$ 396,60** — **preço final de venda ainda pendente de aprovação, ver seção 0.1, item 3.**
- Essencial e Completa não entram como bundle natural.
- Sinastria não entra como primeiro order bump; entra como produto com página/campanha própria ou cross-sell posterior.
- Tracking vem antes de mídia paga.
- Validação gradual vem antes de escala.
- **Checkout: Hotmart, decisão já fechada (D43, `empresa/DECISOES.md`).** Kiwify foi avaliada e descartada — a rota `/webhook/kiwify` já foi removida do backend. Não é uma escolha em aberto neste cronograma.
- **A Fase 5 de automação NÃO é só um plano — já está implementada e em produção desde 15/08/2026** (D51, D54, D55). Ver seção 0.1, item 1, para o fluxo real e o que ainda é manual de propósito.

### Fluxo real hoje (não é mais o fluxo 100% manual da Fase 4B)

1. Cliente compra pelo checkout real da Hotmart (links já publicados, `empresa/LINKS_HOTMART.md`).
2. Cliente acessa a página estática de coleta (`Site/enviar-dados/{produto}/`) e preenche os dados de nascimento + e-mail/telefone usados na compra (verificação de comprador, D47).
3. O backend (`app/server.mjs`, no Railway) gera o relatório e o PDF **sozinho** e grava uma linha na planilha de pedidos com status "aguardando revisão" (D49/D50).
4. Ivã recebe um e-mail com o PDF anexado, confere e-mail/telefone contra o painel da Hotmart, e aprova com 1 clique.
5. O backend envia o PDF final ao cliente automaticamente.

O único passo manual que resta de propósito é o clique de aprovação do passo 4 — é a exceção documentada em `GOVERNANCA_DA_SQUAD_BITNA.md`, seção 14.1 (mantida até os produtos pararem de ter erro recorrente de geração). Todo o resto (checkout, formulário, geração, e-mail) já é automático.

## 0.1 Correções de coerência com o repositório (aplicadas em 13/09/2026 — leia antes de executar)

Este cronograma foi cruzado com o estado real do repositório (`BITNA_SJ`) antes de aprovado. Cinco pontos precisaram de ajuste:

1. **A Fase 5 já existe.** A versão original deste documento tratava a automação (webhook, formulário, geração, e-mail) como trabalho futuro da Semana 1–2. Isso já foi construído e testado de ponta a ponta em 15/08/2026. Rodar a Semana 1–2 como "construir checkout/página/formulário do zero" faria a Squad refazer o que já está no ar — desperdício de 1–2 semanas inteiras. As tarefas dessas semanas foram reformuladas de "construir" para "auditar o que existe e completar só o que falta de verdade" (política de reembolso, texto de LGPD genérico, UTM, dashboard — nada disso existe ainda).
2. **Hotmart vs. Kiwify não é mais uma escolha.** Já foi decidido (D43) e o código já reflete isso (rota do Kiwify removida). O gate de aprovação da Semana 1 e a lista de decisões da seção 9 foram corrigidos para não reabrir essa decisão.
3. **Preço da Jornada Bitna decidido após a checagem de coerência.** O preço antigo de R$249 foi calculado quando a Leitura Completa ainda estava em promoção a R$98. Com os preços atuais, o valor cheio dos componentes é R$396,60. A checagem apontou que ~15% de desconto daria ~R$337; em 17/09/2026 Ivã fechou o preço final em **R$332,00** (D64), preservando a regra comercial/estética de soma dos algarismos chegar a 8 (3+3+2=8). A decisão de preço está fechada; falta refletir esse valor onde houver cadastro/oferta/checkout antes de tráfego pago ou comunicação pública da Jornada.
4. **O Guia Ilustrado do Saju não tem nenhuma infraestrutura ainda.** É produto decidido (D58), mas não existe prompt, motor de conteúdo nem gerador de PDF — nada. Configurá-lo como order bump "quando a plataforma permitir" na Semana 2 pressupõe que o produto já existe para vender. As tarefas que dependem dele foram marcadas como **dependentes do backlog do Guia**, não bloqueantes do lançamento dos outros 3 produtos.
5. **Dois bloqueios do repositório que este cronograma não citava, mas que travam gates específicos:**
   - **Tensão de páginas da Essencial (D45):** a página de venda anuncia "10 a 15 páginas", mas a amostra testada com dado real entrega 9. Isso precisa ser resolvido (produzir mais conteúdo ou baixar a faixa anunciada) **antes** do gate de "copy aprovada" da Semana 2 — senão a copy aprovada promete algo que o produto não entrega hoje.
   - **Produtor divergente na Hotmart:** as duas Sinastrias aparecem à venda em nome de uma pessoa física ("Valdir Antonio Santos"), não da "Bitna Saju" (`empresa/LINKS_HOTMART.md`). Rodar tráfego pago (Campanha C da Semana 4) para esse checkout antes de esclarecer essa titularidade é um risco fiscal/administrativo desnecessário — resolver antes de ativar mídia para a Sinastria Amorosa.

---

## 1. Prioridades ordenadas

### Prioridade 1 — Base vendável e rastreável
**Objetivo:** deixar a operação pronta para receber compra real sem gastar mídia no escuro.

**Nota:** boa parte desta lista já existe em produção (checkout Hotmart, página de obrigado, instrução de envio de dados) — ver seção 0.1, item 1. O trabalho real da Prioridade 1 é auditar isso e completar só o que falta:
- ~~confirmação do preço da Jornada~~ — decidido em D64: R$332,00; falta refletir em cadastro/oferta/checkout antes de comunicação pública;
- ~~escolha Hotmart ou Kiwify~~ — já decidido, Hotmart (D43);
- ~~criação/configuração dos checkouts~~ — já existe, ver `empresa/LINKS_HOTMART.md`;
- ~~página de obrigado~~ / ~~instrução de envio de dados~~ — já existem (`Site/enviar-dados/{produto}/`);
- consentimento LGPD/transparência de IA **genérico** — falta (o consentimento de dados da 2ª pessoa nas Sinastrias já existe, D47/D48; falta o texto geral de LGPD/transparência de IA no formulário);
- política simples de reembolso — falta, listada como pendência aberta em `CONTINUIDADE.md`;
- **UTMs e eventos mínimos + dashboard comercial inicial — não existe nada disso ainda.** Proposta técnica: os 4 formulários capturam `utm_source/utm_medium/utm_campaign` da query string e o backend grava isso na mesma planilha de pedidos já usada pela Fase 5 (D49/D50), numa aba nova "Funil" — reaproveita a conta de serviço do Google já configurada, sem sistema novo. Estimativa: 1–2 dias do Paulo;
- teste ponta a ponta — já foi feito uma vez com pedido sintético (D55); vale repetir incluindo o UTM novo antes de abrir tráfego pago.

**Dependência crítica:** sem tracking mínimo validado, Clone Tráfego não ativa campanha paga.

### Prioridade 2 — Páginas e copy dos 3 testes principais
**Objetivo:** testar hipóteses comerciais sem presumir vencedor.

Páginas/campanhas:
- Essencial: “Descubra quem você é”.
- Completa: “Descubra como sua vida funciona”.
- Sinastria Amorosa: “Entenda o que acontece entre vocês dois”.

**Dependência:** copy aprovada pelo Ivã antes de publicação.

### Prioridade 3 — Conteúdo faceless orgânico
**Objetivo:** iniciar consistência editorial e gerar sinais antes de escalar.

Ritmo inicial:
- 3 Reels por semana;
- 1 carrossel por semana;
- stories leves e recorrentes.

Territórios:
- cultura coreana/Saju;
- autoconhecimento/padrões;
- dor concreta/relacionamentos e escolhas.

### Prioridade 4 — Primeiras vendas controladas
**Objetivo:** validar compra, entrega, dados, satisfação e margem em baixo volume.

Degraus:
- primeira venda real rastreada;
- 5 vendas sem caos operacional;
- 20 vendas acumuladas com aprendizado.

### Prioridade 5 — Pós-compra, retargeting e Jornadas
**Objetivo:** aumentar valor por cliente apenas depois de validar aquisição e entrega.

Inclui:
- upgrade Essencial → Completa;
- cross-sell Completa → Sinastria;
- oferta de Jornada para compradores/leads quentes;
- coleta de satisfação/depoimento autorizado.

---

## 2. Responsáveis sugeridos

- **Naia:** coordenação geral, decisão de foco semanal, alinhamento entre subagentes.
- **Juliana Ops:** cronograma, dependências, checklist operacional, controle de aprovações, rotina semanal e handoff entre áreas.
- **Paulo:** site, páginas, checkout, UTMs, eventos, dashboard, testes técnicos e simulação ponta a ponta.
- **Jonathan:** copy de páginas, anúncios, e-mails, página de obrigado, conteúdo faceless e calendário editorial.
- **Clone Tráfego:** plano de mídia, estrutura de campanhas, UTMs, criativos para teste, ativação controlada somente após tracking validado.
- **Bianca/Amanda:** CRM, atendimento, coleta de dados, respostas padrão, planilha de pedidos, acompanhamento de entrega, satisfação e depoimentos.
- **Ivã:** aprovação de decisões críticas, copy final, promessas, preços, política de reembolso, materiais sensíveis, revisão/qualidade dos PDFs e decisão de avanço entre fases.

---

## 3. Cronograma operacional — 6 semanas, com possibilidade de fechar em 4

### Semana 1 — Fundamento comercial e operacional

**Meta da semana:** sair com escopo fechado, plataforma escolhida e checklist de venda manual pronto.

**Naia**
- Confirmar foco B2C e sequência de validação: Essencial, Completa e Sinastria Amorosa.
- Confirmar que Jornadas ficam para público quente/retargeting, não aquisição fria inicial.
- Priorizar execução manual antes de automação.

**Juliana Ops**
- Montar checklist operacional de pedido manual:
  - compra confirmada;
  - dados recebidos;
  - dados conferidos;
  - PDF gerado;
  - PDF revisado pelo Ivã;
  - PDF enviado;
  - cliente marcado para follow-up.
- Definir SLA realista de entrega manual, preferencialmente conservador.
- Criar matriz de dependências e riscos.

**Paulo**
- Auditar o que já existe (páginas de venda, checkout Hotmart, formulários de coleta, backend no Railway — tudo já publicado, ver seção 0.1) e listar só as lacunas reais: LGPD genérico, política de reembolso, UTM, dashboard.
- Especificar eventos mínimos:
  - view_content;
  - click_cta;
  - begin_checkout;
  - add_order_bump;
  - purchase;
  - refund;
  - upgrade_purchase;
  - cross_sell_purchase.
- Definir padrão de UTMs.

**Jonathan**
- Rascunhar copy das três páginas prioritárias:
  - Essencial;
  - Completa;
  - Sinastria Amorosa.
- Rascunhar página de obrigado e mensagens de coleta de dados.
- Criar primeira grade de conteúdo faceless para 2 semanas.

**Bianca/Amanda**
- Criar respostas padrão para:
  - pedido de dados;
  - dados incompletos;
  - confirmação de recebimento;
  - prazo de entrega;
  - envio do PDF;
  - pedido de feedback.
- Definir planilha/base simples de pedidos.

**Clone Tráfego**
- Não subir mídia ainda.
- Preparar estrutura de campanhas e nomenclatura.
- Definir hipóteses e criativos necessários para Semana 3/4.

**Ponto de aprovação do Ivã — fim da Semana 1**
- Confirmar preços já vigentes (nada a decidir aqui, só confirmar): Essencial R$ 47,60; Completa R$ 149,30; Sinastrias R$ 98,00; Guia R$ 9,80.
- ~~**Decidir o preço final de venda da Jornada Bitna**~~ — decidido em D64: **R$332,00**. Falta refletir no cadastro/oferta/checkout antes de tráfego pago ou comunicação pública da Jornada.
- Aprovar SLA de entrega manual.
- Aprovar política de reembolso simples.
- Aprovar texto de consentimento LGPD/transparência de IA.

**Gate para avançar:** escopo, preços, plataforma, SLA, LGPD e reembolso aprovados.

---

### Semana 2 — Construção das páginas, checkout e tracking

**Meta da semana:** ter funil manual publicável e rastreável, ainda sem mídia paga.

**Paulo**
- Implementar ou ajustar páginas de venda:
  - Essencial;
  - Completa;
  - Sinastria Amorosa.
- Configurar checkouts na plataforma escolhida, sem presumir integração automática.
- Configurar Guia Ilustrado como order bump **assim que o backlog do Guia (D58) entregar prompt + gerador de PDF** — hoje o produto não existe ainda, então esta tarefa não bloqueia o lançamento dos outros 3 produtos.
- Configurar página de obrigado com instruções claras de envio de dados.
- Configurar UTMs e eventos mínimos possíveis para a estrutura atual.
- Criar dashboard inicial por SKU:
  - visitas;
  - cliques CTA;
  - início de checkout;
  - compras;
  - receita bruta;
  - ticket médio;
  - bump aceito;
  - CAC quando houver mídia;
  - margem estimada;
  - tempo até entrega;
  - satisfação.

**Jonathan**
- Finalizar copy das páginas.
- Produzir primeira leva de criativos faceless:
  - 3 Reels;
  - 1 carrossel;
  - variações de chamadas por território.
- Finalizar e-mails/mensagens de coleta de dados.

**Juliana Ops**
- Rodar revisão operacional do funil:
  - o cliente entende o que comprou?
  - o cliente sabe quais dados enviar?
  - a equipe sabe onde registrar cada pedido?
  - Ivã sabe onde entra para gerar/revisar/enviar?
- Criar checklist de teste ponta a ponta.

**Bianca/Amanda**
- Simular atendimento com dados incompletos.
- Validar script de resposta e tom de voz.
- Preparar controle de follow-up pós-compra.

**Clone Tráfego**
- Preparar campanhas em rascunho, sem ativar.
- Revisar UTMs com Paulo.
- Entregar plano de teste inicial com baixo orçamento e critérios de corte.

**Ponto de aprovação do Ivã — meio/fim da Semana 2**
- Aprovar páginas finais antes de publicar.
- Aprovar página de obrigado.
- Aprovar copy dos e-mails/WhatsApp de coleta de dados.
- Aprovar materiais orgânicos da primeira leva.
- Aprovar checklist de qualidade do PDF antes do envio ao cliente.

**Gate para avançar:** compra teste ou simulação rastreada ponta a ponta, incluindo obrigado, coleta, geração/revisão/envio manual e registro no dashboard.

---

### Semana 3 — Soft launch orgânico e primeiras vendas reais

**Meta da semana:** abrir venda controlada sem mídia pesada e observar operação real.

**Naia**
- Coordenar abertura gradual: publicar páginas e iniciar conteúdo orgânico.
- Manter foco em aprendizado, não volume.

**Juliana Ops**
- Acompanhar diariamente:
  - pedidos;
  - dados recebidos;
  - pendências;
  - tempo de entrega;
  - gargalos do Ivã;
  - dúvidas recorrentes.
- Fazer reunião curta de ajuste 2 vezes na semana.

**Paulo**
- Monitorar eventos e UTMs.
- Corrigir problemas de rastreamento/página/checkout.
- Verificar se compras aparecem no dashboard.

**Jonathan**
- Publicar conteúdo faceless no ritmo mínimo:
  - 3 Reels;
  - 1 carrossel;
  - stories leves.
- Ajustar headlines com base em comentários, cliques e dúvidas.

**Bianca/Amanda**
- Operar atendimento e coleta de dados.
- Registrar objeções e dúvidas reais.
- Coletar feedback pós-entrega.

**Ivã**
- Gerar/revisar/enviar PDFs no fluxo manual.
- Sinalizar se o SLA está realista.
- Marcar exemplos de dúvidas ou problemas de qualidade.

**Clone Tráfego**
- Ainda sem mídia paga se tracking não estiver confiável.
- Se tracking estiver validado, preparar ativação controlada para Semana 4.

**Ponto de aprovação do Ivã — fim da Semana 3**
- Aprovar se o funil está maduro para mídia controlada.
- Aprovar quais SKUs entram no primeiro teste pago.
- Aprovar orçamento máximo inicial e critério de pausa.

**Gate para avançar:** pelo menos uma venda real rastreada ou simulação muito próxima da realidade + operação manual sem quebra. Se não houver venda, ainda assim só ativar mídia se tracking e checkout estiverem validados.

---

### Semana 4 — Teste pago controlado e leitura de dados

**Meta da semana:** testar aquisição com baixo desperdício e sem escalar prematuramente.

**Clone Tráfego**
- Ativar campanhas controladas somente com tracking validado.
- Testar hipóteses separadas:
  - Campanha A: Essencial — “Descubra quem você é”.
  - Campanha B: Completa — “Descubra como sua vida funciona”.
  - Campanha C: Sinastria Amorosa — dor relacional concreta. **Só ativar depois de resolvido o produtor divergente na Hotmart (seção 0.1, item 5) — hoje o checkout está em nome de pessoa física, não da Bitna Saju.**
- Usar UTMs padronizadas por campanha, conjunto e criativo.
- Pausar criativos sem clique ou com sinais ruins após janela mínima combinada.

**Paulo**
- Conferir eventos diariamente:
  - clique;
  - início de checkout;
  - compra;
  - bump;
  - origem;
  - SKU.
- Consolidar dashboard de campanha/SKU.

**Juliana Ops**
- Controlar capacidade operacional:
  - quantos pedidos chegaram;
  - quanto tempo Ivã gastou;
  - onde ocorreram atrasos;
  - quantos dados vieram incompletos.
- Atualizar matriz de gargalos.

**Jonathan**
- Produzir variações rápidas de criativos com base nos dados.
- Ajustar copy de página se houver tráfego sem conversão.
- Manter orgânico em paralelo.

**Bianca/Amanda**
- Operar CRM e atendimento.
- Coletar satisfação com perguntas simples:
  - recebeu dentro do prazo?
  - entendeu o relatório?
  - o que mais chamou atenção?
  - autorizaria depoimento sem dados sensíveis?

**Ivã**
- Aprovar eventuais ajustes de promessa/copy.
- Revisar qualidade dos PDFs vendidos.
- Validar se a entrega manual suporta aumento leve de volume.

**Ponto de aprovação do Ivã — fim da Semana 4**
- Decidir manter, pausar ou ajustar cada campanha.
- Aprovar melhor hipótese para continuação.
- Aprovar se o orçamento pode permanecer igual ou subir pouco.
- Aprovar se Jornadas podem entrar apenas para público quente.

**Gate para avançar:** tracking confiável + leitura mínima de CTR/CPC/conversão/CAC/ticket/bump/margem + entrega sem gargalo grave.

---

### Semana 5 — Otimização, pós-compra e retargeting leve

**Meta da semana:** melhorar valor por cliente sem confundir aquisição inicial.

**Juliana Ops**
- Consolidar aprendizados das primeiras vendas.
- Separar problemas por tipo:
  - tráfego;
  - página;
  - checkout;
  - coleta de dados;
  - entrega;
  - satisfação;
  - margem.
- Definir rotina semanal de leitura de métricas.

**Paulo**
- Ajustar dashboard com campos faltantes.
- Implementar eventos de upgrade/cross-sell quando aplicável.
- Melhorar páginas conforme dados reais.

**Jonathan**
- Criar sequência pós-compra:
  - Essencial → convite para Completa;
  - Completa → convite para Sinastria ou Jornada;
  - Sinastria → convite para leituras individuais ou Jornada.
- Criar criativos de retargeting editorial, sem pressão excessiva.

**Clone Tráfego**
- Rodar retargeting leve para:
  - visitantes de página sem compra;
  - iniciaram checkout sem compra;
  - compradores com oferta coerente posterior.
- Não escalar orçamento sem margem entendida.

**Bianca/Amanda**
- Executar follow-up pós-compra.
- Organizar depoimentos autorizados.
- Registrar motivos de desistência, demora ou dados incompletos.

**Ivã**
- Aprovar sequência pós-compra.
- Aprovar depoimentos que poderão virar prova social.
- Aprovar uso restrito de Jornada para base quente.

**Ponto de aprovação do Ivã — fim da Semana 5**
- Aprovar ofertas de pós-compra.
- Aprovar retargeting de Jornadas apenas para público quente.
- Aprovar ajustes de página/copy com base em dados.

**Gate para avançar:** pelo menos sinais de recompra/upgrade/cross-sell ou clareza de que a operação precisa focar ainda em aquisição simples.

---

### Semana 6 — Decisão de continuidade, escala gradual ou correção

**Meta da semana:** fechar ciclo de aprendizado e decidir próximos 30 dias.

**Naia**
- Conduzir reunião de decisão com Squad e Ivã.
- Definir foco do próximo ciclo:
  - Essencial como aquisição;
  - Completa como aquisição premium;
  - Sinastria Amorosa como aquisição por dor concreta;
  - ajuste de páginas/copy;
  - pausa de mídia e reforço orgânico;
  - retargeting/pós-compra.

**Juliana Ops**
- Entregar relatório operacional:
  - vendas por SKU;
  - taxa de dados incompletos;
  - tempo médio de entrega;
  - principais dúvidas;
  - gargalos;
  - capacidade manual real;
  - recomendação de próximo ciclo.
- Avaliar gatilho de automação Fase 5:
  - volume semanal está incomodando?
  - Ivã virou gargalo?
  - há vendas suficientes para justificar automação?
  - há clareza de funil antes de automatizar?

**Paulo**
- Entregar relatório técnico:
  - tracking confiável ou não;
  - eventos faltantes;
  - bugs;
  - qualidade do dashboard;
  - recomendação para Fase 5 somente se houver gatilho.

**Jonathan**
- Entregar relatório de conteúdo/copy:
  - criativos com melhor retenção/clique;
  - território mais promissor;
  - objeções de copy;
  - páginas que precisam de reescrita.

**Clone Tráfego**
- Entregar relatório de mídia:
  - CTR;
  - CPC;
  - CPM;
  - início de checkout;
  - compra;
  - CAC;
  - ROAS;
  - hipótese de otimização.

**Bianca/Amanda**
- Entregar relatório de CRM:
  - dúvidas frequentes;
  - satisfação;
  - depoimentos;
  - problemas de dados;
  - sugestões de melhoria na comunicação pós-compra.

**Ivã**
- Decidir uma das três rotas:
  1. **Continuar validação controlada** com ajustes.
  2. **Aumentar orçamento gradualmente** no SKU/território com melhor sinal.
  3. **Pausar mídia e corrigir base** se tracking, página, checkout ou entrega estiverem frágeis.

**Ponto de aprovação do Ivã — encerramento do ciclo**
- Aprovar SKU prioritário do próximo ciclo.
- Aprovar orçamento do próximo ciclo.
- Aprovar se Fase 5 continua adiada ou entra em planejamento de implementação.
- Aprovar quais páginas/campanhas permanecem ativas.

---

## 4. Versão comprimida em 4 semanas

Se a Squad precisar executar em 4 semanas, juntar assim:

- **Semana 1:** decisões + copy + tracking spec + checkout/página obrigado em construção.
- **Semana 2:** páginas/checkouts/tracking + simulação ponta a ponta + início orgânico.
- **Semana 3:** soft launch + primeiras vendas + correções + aprovação para mídia.
- **Semana 4:** mídia controlada + leitura de dados + decisão de próximo ciclo.

Não comprimir estes gates:
- aprovação de Ivã sobre preço, copy, LGPD e reembolso;
- teste ponta a ponta antes de venda aberta;
- tracking antes de mídia;
- revisão manual de qualidade antes de envio do PDF;
- leitura de margem antes de escalar.

---

## 5. Dependências críticas

- **Checkout depende de:** preço da Jornada já decidido em D64 (**R$332,00**) e ainda pendente de refletir no cadastro/oferta/checkout, produtor da Hotmart regularizado nas Sinastrias antes de mídia paga, bump configurado quando o Guia Ilustrado existir. Plataforma (Hotmart) e cadastro dos produtos já estão feitos.
- **Mídia depende de:** páginas publicadas, UTMs, eventos mínimos, dashboard e compra/simulação rastreada.
- **Sinastria como aquisição depende de:** página própria, coleta clara de dados de duas pessoas, promessa aprovada, capacidade de entrega manual validada.
- **Jornadas dependem de:** Sinastria operacional, capacidade de entregar 3 PDFs, copy de oferta premium, base quente/retargeting.
- **Automação Fase 5 depende de:** gatilho real de volume/tempo/validação; não entra por ansiedade operacional.
- **Escala depende de:** tracking confiável, entrega sem gargalo grave, margem entendida, CAC defensável ou hipótese clara de melhoria.

---

## 6. Indicadores mínimos para gestão semanal

- Visitas por página.
- CTR dos criativos.
- CPC/CPM quando houver mídia.
- Cliques em CTA.
- Início de checkout.
- Compra por SKU.
- Taxa de aceite do Guia como bump.
- Ticket médio.
- Receita bruta e líquida estimada.
- CAC por SKU/campanha.
- Margem de contribuição estimada.
- Tempo médio até recebimento dos dados.
- Tempo médio até entrega do PDF.
- Dados incompletos por pedido.
- Reembolso/chargeback.
- Satisfação pós-entrega.
- Upgrade/cross-sell.

---

## 7. Riscos e mitigação

### Risco: mídia antes de tracking
- **Mitigação:** gate obrigatório de simulação/compra rastreada antes de ativação.

### Risco: checkout criado, mas obrigado/coleta confusos
- **Mitigação:** Bianca/Amanda simulam compra e envio de dados antes de abrir.

### Risco: Ivã virar gargalo na entrega
- **Mitigação:** SLA conservador, limite de orçamento, controle diário de pedidos e gatilho objetivo para Fase 5.

### Risco: tentar vender todos os produtos igualmente
- **Mitigação:** testar hipóteses separadas e não misturar Jornada com aquisição fria.

### Risco: copy prometer previsão/resultado garantido
- **Mitigação:** aprovação obrigatória do Ivã em páginas, anúncios e e-mails.

### Risco: escala por vaidade de métrica
- **Mitigação:** decisão baseada em compra, CAC, margem e entrega, não só clique/engajamento.

---

## 8. Reuniões e rituais

- **Daily operacional curta:** Juliana + responsáveis ativos, 10–15 min, durante Semanas 2 a 5.
- **Revisão de tracking:** Paulo + Clone Tráfego + Juliana, 2 vezes por semana nas Semanas 2 a 4.
- **Revisão de copy/conteúdo:** Jonathan + Naia + Ivã, semanal.
- **Revisão de atendimento:** Bianca/Amanda + Juliana, semanal.
- **Comitê de aprovação:** Ivã + Naia + Juliana no fim de cada semana.

---

## 9. Decisões que Ivã precisa aprovar explicitamente

1. ~~Preço final de venda da Jornada Bitna~~ — decidido em D64: **R$332,00**. Plataforma já está decidida (Hotmart, D43); falta refletir o valor no cadastro/oferta/checkout antes de comunicação pública.
2. Preços e nomes comerciais finais dos demais produtos (já vigentes, só confirmar).
3. Política de reembolso.
4. Texto LGPD/transparência de IA.
5. SLA de entrega manual.
6. Página de obrigado e instruções de coleta de dados.
7. Copy das páginas de venda.
8. Criativos e anúncios antes da mídia paga.
9. Orçamento inicial e critério de pausa.
10. Decisão de avançar ou não para retargeting/Jornadas.
11. Decisão de manter Fase 5 adiada ou iniciar implementação.

---

## 10. Recomendação operacional da Juliana

Eu conduziria o ciclo em **6 semanas** se a prioridade for reduzir retrabalho e proteger qualidade. Dá para comprimir para **4 semanas** se Ivã aprovar rápido e Paulo conseguir fechar checkout/tracking sem bloqueios.

A ordem que eu não mudaria:

1. Fechar decisões comerciais.
2. Configurar checkout/página obrigado/coleta.
3. Instrumentar tracking e dashboard.
4. Testar ponta a ponta.
5. Abrir orgânico e soft launch.
6. Só então ativar mídia controlada.
7. Ler dados antes de escalar.
8. Usar pós-compra/Jornadas apenas com público quente.
9. Deixar Fase 5 para quando houver volume real ou gargalo comprovado.
