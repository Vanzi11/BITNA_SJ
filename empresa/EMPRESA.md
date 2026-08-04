# BITNA SAJU
> Documento de Contexto da Empresa
> Versão 1.2 (03/08/2026)
---
# Visão Geral
A Bitna Saju é uma empresa digital AI First dedicada à divulgação e comercialização de produtos baseados no Saju (Quatro Pilares do Destino), adaptados para o público brasileiro.
O objetivo inicial da empresa é validar rapidamente a aceitação do mercado utilizando produtos digitais de baixo custo, operação enxuta e forte automação por Inteligência Artificial.
A empresa não pretende iniciar com uma estrutura complexa, área de membros robusta ou grande equipe.
A prioridade é:
- validar demanda;
- gerar vendas;
- aprender com clientes reais;
- evoluir os produtos continuamente.
---
# Modelo de Negócio
Empresa extremamente enxuta.
Estrutura inicial:
Instagram → Conteúdo → Anúncios → Landing Page → Hotmart ou Kiwify → Pagamento → Formulário → IA gera relatório → Revisão humana → Envio por e-mail
Todo o processo deve ser simples, rápido e escalável.
---
# Posicionamento
A empresa NÃO vende astrologia como entretenimento.
A empresa vende ferramentas de autoconhecimento e análise de relacionamentos utilizando o sistema oriental Saju.
O foco da comunicação deve ser sempre prático.
Exemplos:
- compreender sua personalidade
- entender seus talentos
- analisar compatibilidade
- refletir sobre carreira
- compreender padrões pessoais
Evitar linguagem excessivamente mística.
---
# Público-alvo
Baseado em pesquisa sintética.
Principal público:
- mulheres
- 18–34 anos
- classes C1/C2
- Sudeste
- interesse por cultura coreana
- interesse por desenvolvimento pessoal
- consumidoras digitais
Dores principais:
- relacionamentos
- carreira
- ansiedade sobre decisões
- autoconhecimento
- compatibilidade amorosa
---
# Produtos
> v1.2 (03/08/2026) — nomes, preços e páginas travados após a **auditoria de coerência** (`AUDITORIA_COERENCIA_PRODUTOS.md`, decisões D25–D29). Cada produto responde a uma pergunta da jornada do cliente. Páginas anunciadas refletem o que o gerador realmente produz (D25). Ver D27 para nomes/preços.

**A jornada do cliente (posicionamento):**
- 🌿 Leitura Essencial → *Quem sou eu?*
- ⭐ Leitura Completa → *Como minha vida funciona?*
- 💞 Sinastria Amorosa → *Como funciona nossa relação?*
- 🤝 Sinastria Profissional → *Como funciona nossa parceria?*

## 🌿 Leitura Essencial — R$ 47
*Descubra quem você é.* Para quem está iniciando a jornada de autoconhecimento pela tradição coreana do Saju. Apresenta os principais padrões do mapa natal — personalidade e forma natural de agir no mundo.
- Seu Elemento Mestre
- Seus principais talentos naturais
- Sua forma de pensar, agir e tomar decisões
- Relatório personalizado em PDF (9 páginas)
- Entrega em até 48 horas

> **Escopo reduzido (D26) + 9 correções de padrão (D30) — ✅ implementados:** foco em "Quem sou eu?" (ciclos, cinco elementos e sinsal saíram para a Completa; núcleo do Mestre do Dia aprofundado). Padrão do PDF atualizado (D30): nome completo + "Cidade - UF" na capa, logo aprovada na capa e no fecho, fonte +1, eyebrow "EDIÇÃO ESSENCIAL · V3 · Ano", página final com os diferenciais da Completa, nome de arquivo `Tipo_Iniciais_Versão_Ano`. Refinado em D31 (nome de arquivo primeiro+último nome completo, fonte +1 só no texto corrido preservando títulos, logo maior na capa, cards da p.3 alargados, "www." no site, tópicos da p.9 maiores). Amostra canônica: `relatorios/exemplos/Essencial_IvaMRSantos_V3_2026.pdf` (9 páginas, testada com dado real). *Implementação: `app/pdf/gerar_pdf.py` + `app/server.mjs` + `relatorios/prompts/leitura_individual.md` (id técnico `essencial`).*

## ⭐ Leitura Completa — R$ 97 (de R$ 120)
*Descubra como sua vida funciona.* Amplia a Leitura Essencial com uma visão aprofundada dos ciclos, potenciais e padrões do mapa. Inclui tudo da Essencial +
- Os Quatro Pilares completos (Ano, Mês, Dia e Hora)
- Mapa dos Cinco Elementos: equilíbrios e excessos naturais
- Ciclos da Vida e tendências de prosperidade e desafios
- Períodos de aprendizado
- Estratégias para harmonizar seus padrões
- Relatório completo e aprofundado em PDF (cerca de 26 páginas; varia com o mapa)
- Prioridade de entrega

*Nome comercial "Leitura Completa" (renomeado de "Premium" — D27); id técnico interno segue `premium`. Implementação: `app/pdf/premium_v5/build_pdf.py` + `relatorios/prompts/leitura_premium.md`.*

## 💞 Sinastria Amorosa (Saju de Casal) — R$ 97
*Como funciona nossa relação?* Para casais, pessoas se conhecendo ou quem quer compreender uma relação afetiva. Não descreve indivíduos — descreve o relacionamento.
- Pontos de conexão e fontes de conflito
- Como cada um demonstra carinho, expressa afeto e segurança
- O que fortalece a relação e o que merece atenção
- Estratégias para uma relação mais harmoniosa
- Relatório especial em PDF (12–16 páginas — estimativa; gerador a construir, D28)
- Entrega em até 48 horas

## 🤝 Sinastria Profissional — R$ 97
*Como funciona nossa parceria?* Para sócios, parceiros de negócios, colegas de trabalho ou amizades importantes. Como duas pessoas funcionam juntas em ambientes profissionais.
- Compatibilidade e complementaridade entre os perfis e talentos
- Como cada pessoa toma decisões e se comunica
- Pontos fortes da parceria e possíveis fontes de conflito
- Estratégias para fortalecer a parceria
- Relatório especial em PDF (12–16 páginas — estimativa; gerador a construir, D28)
- Entrega em até 48 horas

*Implementação (Amorosa e Profissional): mesmo motor + mesmo prompt-base `relatorios/prompts/sinastria.md` + **mesmo gerador de PDF** `app/pdf/sinastria/build_sinastria.py`, diferenciados pelo campo `tipoRelacao`. 1 SKU técnico, 2 posicionamentos, com tema por tipo (Seal Red amorosa / Matte Bronze profissional). **PDF construído e testado (D34), 10 páginas com 2 diagramas (ciclo dos elementos + complementaridade) e orientação individual a cada pessoa.** Amostras em `relatorios/exemplos/sinastria_*_AMOSTRA_v2.pdf`.*

## 🌸 Jornadas Bitna — R$ 249 (de R$ 291)
*Para quem quer compreender a si mesmo e seus relacionamentos.* Bundle de relatórios já existentes (~15% de desconto sobre a soma).
- **Jornada Amorosa** — 2 Leituras Completas (uma para cada pessoa) + 1 Sinastria Amorosa
- **Jornada Profissional** — 2 Leituras Completas (uma para cada pessoa) + 1 Sinastria Profissional
- 3 relatórios personalizados, com prioridade de entrega (até 48 horas)

*Produto novo (D29) — empacotamento, sem motor/prompt novo. Depende do PDF de Sinastria (D28), de formulário multi-pessoa e do fluxo de entrega dos 3 PDFs juntos. Substitui na prática o "Mapa Completo do Parceiro" (D4), agora fora do line-up.*

## Clube Saju — R$ 27,90/mês (fase 2)
Horóscopo coreano mensal, conteúdos exclusivos, comunidade, descontos, novas leituras, sinastrias promocionais. Inicialmente conceito — não construir agora.
---
# Estratégia Comercial
Funil: Instagram → Conteúdo → Venda → Entrega → Relacionamento → Recorrência
---
# Tecnologia
AI First. IA para: geração dos relatórios, revisão, atendimento, conteúdo, marketing, copywriting, pesquisa, SEO, automações.
Humano: revisão, decisões, melhoria contínua, estratégia.
---
# Presença Digital
Domínio: a definir — bitnasaju.com.br (ou equivalente) precisa ter disponibilidade confirmada antes do registro (ver D23)
Canais iniciais: site institucional, Instagram.
Futuro: Clube Saju, área de membros.
---
# Filosofia da Empresa
Antes de automatizar, validar. Antes de escalar, vender. Antes de sofisticar, simplificar.
Toda decisão prioriza velocidade de implementação, aprendizado com clientes reais e melhoria contínua.
O objetivo da primeira fase não é construir uma plataforma, mas validar um modelo de negócio sustentável.
