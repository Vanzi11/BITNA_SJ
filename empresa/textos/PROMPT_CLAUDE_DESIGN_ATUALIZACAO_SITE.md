# Prompt para o Claude Design — transformar artigos e política em seções da página única

Copiar o bloco abaixo (colando dentro do mesmo projeto do site no Claude Design — a
ideia é EDITAR a página principal existente, não criar páginas novas).

**Contexto do problema que este prompt resolve:** os 3 artigos e a Política de
Privacidade foram criados como páginas separadas linkadas (`Artigo - Elemento
Mestre.dc.html` etc.). Ao publicar no servidor, essas páginas redirecionam de volta
pra home assim que carregadas diretamente — eram exportadas como "página aninhada"
(dependem da página principal pra funcionar, não são arquivos independentes de
verdade). A solução é não ter páginas separadas: todo o site já funciona como uma
página única com navegação por âncora (`#produtos`, `#saju` etc.) — os 4 conteúdos
abaixo devem virar seções dessa mesma página, não arquivos novos.

---

```
Você vai editar a página principal do site institucional da Bitna Saju (o projeto
já aberto). Mantenha 100% do sistema visual existente — paleta de cores,
tipografia, layout, espaçamento, estilo dos componentes. Esta tarefa é de
CONTEÚDO e estrutura de navegação, não de redesign.

REGRAS QUE NÃO PODEM SER QUEBRADAS:
1. Não invente depoimentos de clientes nem novo texto jurídico. Os depoimentos
   continuam placeholder. O texto da Política de Privacidade já vem pronto
   abaixo — use exatamente esse texto, não resuma nem complete os colchetes.
2. Tom de voz institucional (sóbrio, educativo, respeitoso, atemporal) para os
   3 artigos — já está pronto no texto abaixo, não precisa reescrever.
3. NÃO crie páginas HTML separadas. Os 4 conteúdos abaixo devem virar seções
   NOVAS dentro da MESMA página, cada uma com um id de âncora, no mesmo
   padrão das seções que já existem (ex.: a seção com id="produtos").

TAREFA 1 — Criar 4 novas seções na página, com âncora
Adicione 4 novas seções ao final da página (antes do rodapé), cada uma com um
id específico:
- id="artigo-elemento-mestre"
- id="artigo-sinastria"
- id="artigo-hora-nascimento"
- id="politica-privacidade"

Cada seção de artigo deve ter: a categoria pequena (ex. "FUNDAMENTOS") acima do
título, o título como h2/h3 no estilo já usado no resto do site, os parágrafos
de corpo no mesmo estilo tipográfico do resto do conteúdo institucional, e um
link "Voltar" que leva de volta pra seção de artigos (#artigos) no topo ou fim
da seção.

TAREFA 2 — Corrigir os links que hoje apontam pra arquivo separado
Na seção "PARA CONTINUAR APRENDENDO", troque os 3 hrefs de:
  ./Artigo - Elemento Mestre.dc.html      →  #artigo-elemento-mestre
  ./Artigo - Sinastria.dc.html            →  #artigo-sinastria
  ./Artigo - Hora de Nascimento.dc.html   →  #artigo-hora-nascimento
No rodapé, troque o href de "Política de Privacidade" de
  ./Bitna Saju - Politica de Privacidade.dc.html  →  #politica-privacidade

TAREFA 3 — Conteúdo das 4 seções (usar exatamente como está abaixo)

--- SEÇÃO 1 (id="artigo-elemento-mestre", categoria: FUNDAMENTOS) ---
Título: O que é o Elemento Mestre?

Toda pessoa tem um jeito de ser que parece ter estado ali desde sempre — uma
forma de reagir, de decidir, de ocupar espaço, que continua reconhecível mesmo
quando a vida muda ao redor. O Saju dá um nome a essa constante: o Mestre do
Dia, popularmente chamado de elemento mestre.

O que é
No sistema dos quatro pilares, cada pilar — ano, mês, dia e hora — é formado
por dois caracteres: um tronco celeste e um ramo terrestre. O tronco do pilar
do dia recebe um nome específico na tradição: Mestre do Dia. É o caractere que
representa o "eu" no mapa — o ponto de referência a partir do qual todos os
outros elementos do Saju são lidos.

Existem dez troncos celestes possíveis, e cada um pertence a um dos cinco
elementos — Madeira, Fogo, Terra, Metal ou Água — em uma de duas polaridades,
yang ou yin. Por isso se fala, por exemplo, em "Madeira Yang" ou "Madeira
Yin": duas expressões diferentes do mesmo elemento, com temperamentos
distintos entre si.

Por que importa
Um mapa de Saju tem oito caracteres ao todo, e cada um deles conversa com os
outros sete. Sem um ponto de referência, essa conversa não tem começo. O
Mestre do Dia é esse ponto: é em relação a ele que o Saju organiza o resto do
mapa em dez papéis funcionais — como a pessoa cria, como gera valor, como
lida com autoridade, de onde vem o que ela sabe. Entender o Mestre do Dia é o
primeiro passo de qualquer leitura, porque é a partir dele que o resto começa
a fazer sentido.

Como funciona
Cada um dos dez troncos celestes carrega uma imagem que a tradição associa a
ele havia séculos — não como decoração, mas como forma de tornar o conceito
tangível. Madeira Yang, por exemplo, costuma ser associada ao carvalho: cresce
reto, não pede licença. Madeira Yin, à hera ou ao bambu: encontra caminho onde
não há porta, flexível por fora e decidida por dentro. Metal Yang é a espada
já forjada; Metal Yin, a joia pequena e preciosa. Cada uma das dez imagens
descreve uma forma diferente de sustentar identidade sob pressão.

O elemento do Mestre do Dia também se relaciona com os outros elementos
presentes no mapa através de dois ciclos clássicos: o ciclo de geração (um
elemento alimenta o seguinte — a Água nutre a Madeira, a Madeira alimenta o
Fogo) e o ciclo de controle (um elemento contém o outro — a Terra represa a
Água, a Água apaga o Fogo). Nenhum desses ciclos é bom ou ruim por si só: são
as engrenagens que explicam por que certas combinações de elementos no mapa
de uma pessoa produzem fluidez, e outras produzem atrito.

O que muda na vida da pessoa
Saber o próprio Mestre do Dia não é receber um rótulo fixo — é ganhar um
vocabulário para reconhecer um padrão que provavelmente você já percebia, mas
não sabia nomear. Não é sobre prever o que vai acontecer; é sobre entender
por que você reage do jeito que reage quando a pressão aparece, e usar isso
como ponto de partida para decidir com mais clareza, não menos.

--- SEÇÃO 2 (id="artigo-sinastria", categoria: RELACIONAMENTOS) ---
Título: Como funciona a Sinastria

Duas pessoas podem ter mapas de Saju completamente diferentes e, ainda assim,
se completarem bem — ou ter mapas parecidos e viverem um atrito constante. A
sinastria é o ramo do Saju dedicado a entender por quê.

O que é
Na tradição coreana, esse cruzamento de dois mapas é chamado de gunghap
(宮合). Não é um teste de compatibilidade com resultado de aprovado ou
reprovado — é uma leitura de como duas estruturas de energia se comportam
quando colocadas lado a lado. O gunghap tradicionalmente nasceu para orientar
decisões de casamento, mas o mesmo princípio se aplica a qualquer relação
próxima e continuada: sociedade, amizade, família.

Por que importa
Autoconhecimento individual explica como uma pessoa funciona sozinha. Mas boa
parte da vida acontece em relação a outras pessoas — e é aí que padrões que
pareciam claros no mapa de cada um se tornam mais difíceis de prever. A
sinastria existe porque a pergunta "como eu sou" e a pergunta "como eu sou ao
lado de alguém" nem sempre têm a mesma resposta.

Como funciona
A leitura cruza os mapas das duas pessoas usando os mesmos princípios de
qualquer leitura individual — elementos, os quatro pilares, o Mestre do Dia
de cada uma — mas olhando para a relação entre eles, não para cada mapa
isoladamente. Alguns cruzamentos são de geração: o elemento de uma pessoa
naturalmente alimenta o elemento da outra, o que costuma se traduzir em apoio
que flui sem muito esforço. Outros são de controle: o elemento de uma pessoa
tende a conter o elemento da outra, o que não é automaticamente ruim — muitas
vezes é o que dá estrutura a uma relação que, sozinha, se dispersaria — mas
costuma pedir mais intenção para não virar atrito.

O que também importa é o que falta: quando um elemento ausente no mapa de uma
pessoa é justamente o elemento que sobra no mapa da outra, a sinastria
costuma revelar uma complementaridade real, não só coincidência — é o tipo de
dado que só aparece quando os dois mapas são lidos juntos.

O que muda na vida da pessoa
Uma leitura de sinastria não determina se uma relação deve continuar ou
terminar — isso permanece uma decisão de quem vive a relação, feita de
escolhas, diálogo e cuidado mútuo. O que ela oferece é vocabulário
compartilhado: nomear por que um mesmo gesto é recebido de formas diferentes
por cada lado, e onde vale investir intenção para que o que já flui continue
fluindo, e o que gera atrito pare de pegar as duas pessoas de surpresa.

--- SEÇÃO 3 (id="artigo-hora-nascimento", categoria: ORIGENS) ---
Título: Por que a hora de nascimento importa

Data de nascimento já diz bastante sobre um mapa de Saju. Mas sem a hora, a
leitura permanece incompleta — e a diferença não é de detalhe, é de uma
dimensão inteira do mapa.

O que é
O Saju é lido em quatro pilares — ano, mês, dia e hora — e cada um
corresponde a uma fase da vida e a uma área de experiência. O pilar do ano
fala da origem e da herança que a pessoa carrega. O do mês, de como ela se
posiciona no mundo, no trabalho e na vida pública. O do dia, do seu núcleo
mais íntimo. E o da hora, dos projetos, da maturidade e do que a pessoa
constrói e deixa como legado. Sem o horário de nascimento, esse quarto pilar
simplesmente não existe na leitura — o mapa fica com três colunas em vez de
quatro.

Por que importa
O dia é dividido em doze blocos de duas horas, e cada bloco corresponde a um
ramo terrestre diferente — o mesmo sistema usado para os doze animais do
calendário chinês e coreano. Duas pessoas nascidas no mesmo dia, mas em
horários diferentes, têm pilares do dia idênticos e pilares da hora
completamente diferentes. Uma parte real da leitura — sobretudo tudo que
envolve os ciclos futuros e o potencial de longo prazo — muda de figura
dependendo de qual desses doze blocos corresponde ao nascimento.

Como funciona
Para calcular corretamente o pilar da hora, não basta o horário aproximado —
é preciso o horário mais preciso possível, de preferência tirado de um
registro (certidão, boletim de hospital) e não da memória. O cálculo também
leva em conta a posição solar real do local de nascimento, não só o fuso
horário oficial: duas cidades no mesmo fuso podem, na prática, ter horários
solares levemente diferentes, e é essa posição solar verdadeira que o Saju
tradicionalmente usa como referência — não o relógio de parede.

Quando o horário exato não está disponível, ainda é possível fazer uma
leitura com os três primeiros pilares — mas ela vem, por natureza,
incompleta: sem acesso à dimensão de projetos e legado que só o quarto pilar
revela.

O que muda na vida da pessoa
Vale o esforço de buscar o horário mais preciso possível antes de pedir uma
leitura — perguntar aos pais, procurar a certidão de nascimento, checar
registros de hospital. Não é burocracia: é a diferença entre um mapa com as
quatro dimensões completas e um mapa que só consegue contar três quartos da
história.

--- SEÇÃO 4 (id="politica-privacidade") ---
Título: Política de Privacidade

Política de Privacidade — Bitna Saju

Última atualização: 01/08/2026

1. Quem somos
A Bitna Saju é responsável pelo tratamento dos dados pessoais descritos nesta
política. Dúvidas ou pedidos sobre seus dados podem ser enviados para
contato@bitnasaju.com.br.

2. Quais dados coletamos
Para gerar sua leitura de Saju, coletamos: nome completo, data de nascimento,
horário de nascimento (quando informado), cidade e estado de nascimento, e
sexo. Esses dados são fornecidos diretamente por você, no momento da compra.

3. Por que coletamos
Usamos esses dados exclusivamente para calcular o seu mapa de Saju e produzir
o relatório interpretativo que você comprou. O cálculo do mapa é
determinístico (feito por um motor próprio, não por inteligência artificial);
a escrita do texto interpretativo conta com apoio de inteligência artificial,
sempre com revisão humana antes do envio.

4. Com quem compartilhamos
Não compartilhamos, vendemos ou cedemos seus dados a terceiros para nenhuma
outra finalidade. Seus dados de nascimento não são usados para treinar
modelos de inteligência artificial de terceiros.

5. Por quanto tempo guardamos
Guardamos seus dados pelo tempo necessário para produzir e entregar seu
relatório, e por mais 90 dias após a entrega, para eventual suporte ou
reenvio. Após esse prazo, os dados são excluídos, salvo obrigação legal de
retenção.

6. Seus direitos
Como titular dos dados, você pode a qualquer momento pedir para: acessar os
dados que temos sobre você, corrigir dados incorretos, ou solicitar a
exclusão dos seus dados. Basta escrever para contato@bitnasaju.com.br.

7. Cookies
No momento, este site não utiliza cookies de rastreamento, análise de
tráfego ou publicidade. Usamos apenas os recursos técnicos estritamente
necessários para o funcionamento do site.

8. Alterações desta política
Podemos atualizar esta política eventualmente. Mudanças relevantes serão
comunicadas nesta mesma página.

Ao terminar, me devolva o arquivo HTML da página completa e atualizada,
exportado como "Standalone HTML" (não como páginas separadas), pronto pra eu
subir no lugar do index.html atual.
```

---

**Depois que o Claude Design devolver o arquivo:**
1. Confira rapidamente se os 4 links (3 artigos + rodapé) realmente viram `#âncora` e não mais `.html` separado — teste clicando em cada um antes de publicar.
2. Preencha os placeholders da política (`[data]`, `[X]`, `[período]`) e mande pro advogado revisar antes de publicar de vez — isso não muda, continua pendente.
3. Suba como um único arquivo `index.html` no cPanel, substituindo o atual (mesmo processo de sempre: renomear o antigo pra `013index.html`, subir o novo, testar em aba anônima).
