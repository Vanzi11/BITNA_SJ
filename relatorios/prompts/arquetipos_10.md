# Os 10 Arquétipos — nomenclatura oficial e banco de conteúdo

Fonte única de nomes e conteúdo de referência para os 十神 (dez papéis / "dez deuses" na tradução tradicional). Decisão registrada em `DECISOES.md` D40 (05/08/2026, revisão da Leitura Completa). Ver também `GUIA_DE_VOZ.md` → "Nomenclatura oficial" e "Espírito Poético Explicativo do Saju".

## Regra de nomenclatura (inviolável)

**Nunca usar a palavra "Deuses"** em texto de cliente, em nenhum produto, a partir de 05/08/2026. Prioridade de substituição:
1. **"Arquétipo"** (padrão, use sempre que couber).
2. **"Estrela"** (só se "Arquétipo" não couber no espaço/ritmo da frase).

A categoria inteira é **"os 10 Arquétipos"** (já era D39). A partir do D40, os **nomes individuais também mudam** — não é mais só a categoria.

## Os 10 nomes oficiais (Português + romanização + hanja)

Use esta forma completa **na primeira menção** de cada arquétipo em um relatório. Nas menções seguintes, pode abreviar para só o nome do papel em português (ex.: "o Executor" em vez de repetir o nome inteiro toda vez) — ver regra de lembrete curto no `GUIA_DE_VOZ.md`.

| # | Nome oficial completo | Nome técnico antigo (chave interna do motor — não usar no texto do cliente) |
|---|---|---|
| 1 | O Arquétipo do Amigo (Bi Jian - 比肩) | Companheiro |
| 2 | O Arquétipo do Competidor (Jie Cai - 劫財) | Rival |
| 3 | O Arquétipo do Alimento / Criador Confiante (Shi Shen - 食神) | Deus do Alimento |
| 4 | O Arquétipo do Executor / Oficial Ferido (Shang Guan - 傷官) | Oficial Ferido |
| 5 | O Arquétipo do Administrador / Riqueza Direta (Zheng Cai - 正財) | Riqueza Direta |
| 6 | O Arquétipo do Empreendedor / Riqueza Indireta (Pian Cai - 偏財) | Riqueza Indireta |
| 7 | O Arquétipo do Diplomata / Oficial Direto (Zheng Guan - 正官) | Oficial Direto |
| 8 | O Arquétipo do Guerreiro / Oficial Indireto (Qi Sha - 七殺) | Oficial Indireto (Sete Matanças) |
| 9 | O Arquétipo do Mentor Erudito / Selo Direto (Zheng Yin - 正印) | Selo Direto |
| 10 | O Arquétipo do Místico / Selo Indireto (Pian Yin - 偏印) | Selo Indireto |

**Nota técnica importante:** o motor (`fortuneteller/`) e o JSON calculado (`dezDeuses.distribuicao`, `dezDeuses.porPilar`) continuam usando os **nomes técnicos antigos** como chaves internas (ex. `"Deus do Alimento"`) — isso é dado calculado, não texto de cliente, e não foi alterado por esta decisão (mudar chaves do motor teria efeito cascata sobre todos os geradores de PDF e testes). Os geradores de PDF (`app/pdf/premium_v5/build_pdf.py` etc.) fazem a tradução chave-antiga → nome-oficial-novo só na camada de exibição. Ao escrever prosa, sempre parta do nome oficial novo desta tabela — nunca do nome técnico antigo.

## Banco de conteúdo — "O que é" / "Como se manifesta"

Material de referência trazido pelo Ivã (05/08/2026) para inspirar a profundidade e precisão de cada arquétipo quando ele se manifesta com força no mapa de um cliente. **Isto é matéria-prima, não texto pronto**: ao escrever um relatório, sempre passar pelo teste do "Espírito Poético Explicativo do Saju" (`GUIA_DE_VOZ.md`) — reescrever no tom acolhedor e concreto da casa, nunca colar esta lista em formato de verbete/Wikipédia.

**O Arquétipo do Amigo (Bi Jian - 比肩)**
- O que é: representa igualdade, autoconfiança e conexão com os outros de igual para igual.
- Como se manifesta: independência, foco no eu, forte autoestima e habilidade para trabalhar em equipe de forma cooperativa. Em excesso, pode gerar teimosia.

**O Arquétipo do Competidor (Jie Cai - 劫財)**
- O que é: representa a rivalidade, o carisma de liderança e o instinto de sobrevivência social.
- Como se manifesta: charme extremo, alta sociabilidade, perfil competitivo e capacidade de persuasão. Negativamente, pode levar ao desperdício de dinheiro (daí o nome tradicional "roubar riqueza") ou ao estresse por comparação.

**O Arquétipo do Alimento / Criador Confiante (Shi Shen - 食神)**
- O que é: expressão artística interiorizada, focada no prazer e na qualidade.
- Como se manifesta: criatividade calma, amor pela gastronomia e conforto, busca pelo prazer na vida, intelecto refinado e generosidade sem esperar nada em troca.

**O Arquétipo do Executor / Oficial Ferido (Shang Guan - 傷官)**
- O que é: expressão agressiva, voltada para o exterior, para o palco, para chocar e mudar as regras.
- Como se manifesta: eloquência, rebeldia contra a autoridade, talento brilhante para palcos ou debates, ambição alta e necessidade de reconhecimento rápido.

**O Arquétipo do Administrador / Riqueza Direta (Zheng Cai - 正財)**
- O que é: trabalho duro, estabilidade financeira e bens conquistados de forma previsível.
- Como se manifesta: pé no chão, honestidade, disciplina, foco em rotinas, economia de recursos e apego à segurança material.

**O Arquétipo do Empreendedor / Riqueza Indireta (Pian Cai - 偏財)**
- O que é: visão de negócios de alto risco, investimentos e ganhos inesperados ou rápidos.
- Como se manifesta: mente focada em oportunidades, generosidade com dinheiro, carisma, paixão pela liberdade e habilidade para negociar ou delegar tarefas.

**O Arquétipo do Diplomata / Oficial Direto (Zheng Guan - 正官)**
- O que é: leis, respeito às regras sociais, moralidade e ordem estabelecida.
- Como se manifesta: senso de dever, obediência, foco na reputação, autopreservação e desejo de estabilidade corporativa ou governamental.

**O Arquétipo do Guerreiro / Oficial Indireto (Qi Sha - 七殺)**
- O que é: pressões externas drásticas, resiliência em crises e força bruta para vencer desafios.
- Como se manifesta: coragem extrema, liderança em momentos difíceis, perfil estrategista e impulsividade. Mal equilibrado, traz sensação crônica de perigo ou conflito.

**O Arquétipo do Mentor Erudito / Selo Direto (Zheng Yin - 正印)**
- O que é: conhecimento tradicional, amor materno incondicional, saúde e proteção.
- Como se manifesta: paciência, mente aberta para o aprendizado acadêmico, busca por sabedoria, passividade benéfica e intuição protetora.

**O Arquétipo do Místico / Selo Indireto (Pian Yin - 偏印)**
- O que é: conhecimento não convencional, o oculto, intuição aguçada e autoproteção psicológica.
- Como se manifesta: pensamento fora da caixa, ceticismo saudável, interesse por metafísica/astrologia, autopreservação emocional e habilidades técnicas muito raras.
