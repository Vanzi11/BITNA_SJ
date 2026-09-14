# app/ — Backend e geração de PDF

- `server.mjs` — backend HTTP sem dependências (Node ≥18, `--env-file-if-exists` exige Node ≥20.6). Rotas: `/` (UI), `/cidades`, `/leitura`, `/sinastria`, `/diaria`, `/pdf`, `/pdf-sinastria`, `/enviar-dados/:produto/dados` (Fase 5), `/pedidos/:id/aprovar` (Fase 5). Rodar (da raiz do repo): `node --env-file-if-exists=app/.env app/server.mjs` (define TZ=Asia/Seoul internamente). Com `ANTHROPIC_API_KEY` + `gerarRelatorio:true`, gera o relatório narrativo via API. Credenciais da Fase 5 (Resend, Google Sheets) ficam em `app/.env` — copiar de `app/.env.example`, nunca commitar.
- `public/index.html` — painel de teste (3 abas, autocomplete de cidades, botão Baixar PDF).
- `pdf/gerar_pdf.py` — gerador de PDF v4 (paramétrico, funciona para QUALQUER cliente; visual anterior). Requer `pip install reportlab pypdf`.
- `pdf/premium_v5/` — gerador do VISUAL APROVADO (v5, "livro de Seul"), vindo do Lovable/Gemini. Parametrizado desde 19/07/2026 (D14): recebe `entrada.json saida.pdf` como qualquer outro gerador, paginação e páginas variam com o texto real (não é mais fixo em 18). Usado pelo produto "Leitura Completa" (nome comercial; id técnico segue `premium`).
- `pdf/sinastria/build_sinastria.py` — gerador das duas Sinastrias (Amorosa/Profissional), parametrizado por `tipoRelacao` (D34).
