# Site/ — Site institucional publicado em bitnasaju.com.br

O que está ao vivo em produção (D52, 15/08/2026), como HTML estático independente por página (sem o bundler multi-página do Claude Design — ver `empresa/textos/PROMPT_CLAUDE_DESIGN_ATUALIZACAO_SITE.md` para o porquê):

- `leitura-essencial/`, `leitura-completa/`, `sinastria-amorosa/`, `sinastria-profissional/` — páginas de venda dos 4 produtos, cada uma com um `enviar-dados/` (ver abaixo).
- `enviar-dados/{produto}/` — formulários de pós-compra (dados de nascimento + verificação do comprador, D47/D48). O `action` de cada formulário aponta para o backend real no Railway (`app/server.mjs`, rota `/enviar-dados/:produto/dados`, D54/D55).
- `assets/` — imagens de produto e o hero de paisagem de montanhas (D46) usados pelas páginas de venda.
- `Imagens/` — fontes originais (maior resolução) das imagens usadas em `assets/`.
- `artigos/` (e os `Artigo - *.dc.html` na raiz desta pasta) — 3 artigos institucionais (Elemento Mestre, Hora de Nascimento, Sinastria).
- `Bitna Saju - Home Institucional.dc.html` / `Bitna Saju - Site Institucional (standalone).html` — fonte editável (Claude Design) e versão standalone da home institucional.
- `Bitna Saju - Politica de Privacidade.dc.html`, `Bitna Saju - Guia de Marca*.dc.html` — páginas institucionais complementares.
- `support.js`, `image-slot.js` — scripts de suporte do site (Claude Design / troca de imagens).
- `Arquivos em ZIPs/` — pacotes já publicados no cPanel (histórico de deploy), não editar direto.
- `pesquisa Manus/` — material de pesquisa/referência visual, não faz parte do site publicado.

**Antes de editar qualquer página já publicada:** o arquivo ao vivo no servidor é a fonte de verdade até ser puxado de volta pro repositório (ver D53 — algumas correções pós-publicação foram feitas direto no arquivo publicado via `curl`/edição por posição exata, depois sincronizadas aqui). Confirme com `empresa/DECISOES.md` (D43–D55) qual foi o último estado publicado antes de assumir que este diretório reflete o que está no ar.
