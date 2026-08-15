# Fase 5 (plano) — Automação de vendas: webhook → formulário → geração → aprovação → envio

> Status: **passos 1–3 implementados e testados localmente (14/08/2026, D50)** — falta configurar credenciais reais (Resend, Google Sheets), o webhook da Hotmart e o deploy no Railway (passos 4–6). Hospedagem: **Railway** (decisão fechada, D44). Plataforma de venda: **Hotmart** (decisão fechada, D43). Painel de pedidos: **Google Sheets + e-mail** (decisão fechada, D49). Formulários: as 8 páginas do site (D43–D48) já existem como HTML estático em `Site/enviar-dados/{produto}/` — isso muda o desenho original abaixo (ver seção "O que mudou").

## Objetivo

Cliente compra → recebe um link pro formulário estático do produto (`Site/enviar-dados/{produto}/`) → preenche os dados de nascimento (+ e-mail/telefone da compra, pra verificação manual) → sistema gera leitura + PDF sozinho (reaproveitando `/leitura`, `/sinastria`, `/pdf` já prontos e testados) → grava uma linha na planilha de pedidos → Ivã recebe e-mail com o PDF pra revisar → Ivã aprova com 1 clique → cliente recebe o PDF final por e-mail. Nenhuma peça nova toca no motor de cálculo, no prompt ou no gerador de PDF — só orquestra o que já existe.

## O que mudou desde a versão original deste plano

1. **O formulário não é mais servido pelo backend** (`GET /pedidos/:token/formulario` não existe mais) — é HTML estático já publicado no site (`Site/enviar-dados/{produto}/`, uma página por produto, D43–D48). O backend só recebe o `POST` do `action` do formulário.
2. **Sem token por pedido.** Como o formulário é uma URL fixa por produto (não gerada por pedido), não há como amarrar cada envio a uma compra específica via token. A verificação de "isso é um comprador legítimo?" é **manual**: os campos `email_compra`/`telefone_compra` (D47) vão pra planilha, e o Ivã confere contra o painel de vendas da Hotmart antes de aprovar — nada automático nesta fase (dá pra automatizar depois, cruzando com o payload do webhook).
3. **O "painel de pedidos" é uma planilha do Google**, não uma página `/pedidos/:id/status` própria (D49) — decisão pela familiaridade e zero custo. Cada envio de formulário vira uma linha nova.

## Modelo de dados do `pedido` — agora como linha de planilha, não JSON

Cada envio de formulário grava uma linha na planilha (uma aba por produto, ou uma aba única com coluna "produto" — decidir na implementação). Colunas:

```
carimboDataHora | produto | emailCompra | telefoneCompra | nome (ou nomePessoa1/nomePessoa2)
| dataNascimento | horaNascimento | cidadeNascimento | paisNascimento | sexo
| tipoRelacao (só sinastria) | status ("aguardando revisão" | "aprovado" | "enviado")
| linkPdf (se guardarmos o PDF em algum lugar acessível) | observações
```

`status` começa em "aguardando revisão" (preenchido pelo backend ao gravar a linha) e o Ivã atualiza manualmente conforme processa — mesma lógica de controle de qualidade manual já usada na Fase 4B, só que documentada em planilha em vez de e-mail solto.

## Rotas novas (somam às já existentes: `/`, `/cidades`, `/leitura`, `/sinastria`, `/diaria`, `/pdf`)

| Rota | Método | Função |
|---|---|---|
| `/webhook/hotmart` | POST | Recebe aviso de compra da Hotmart. Valida assinatura (`hottok`). Envia e-mail ao cliente com o link da página estática do formulário do produto comprado (`bitnasaju.com.br/enviar-dados/{produto}/`). |
| `/enviar-dados/:produto/dados` | POST | Destino do `action` dos 4 formulários estáticos (substitui os placeholders `[FORM_ENDPOINT_*]`). Recebe os dados, grava a linha na planilha (status `aguardando revisão`), **dispara a geração na hora** (mesma lógica de `/leitura`/`/sinastria` com `gerarRelatorio:true`, depois `/pdf`), e manda e-mail pro Ivã com o PDF anexado + link de aprovação. |
| `/pedidos/:id/aprovar` | GET | Link clicável no e-mail do Ivã. Muda o status da linha na planilha pra `aprovado`, dispara e-mail final ao cliente com o PDF, muda status pra `enviado`. |

## Peças que faltam e precisam de escolha/configuração

1. **Envio de e-mail** — três opções, todas viáveis sem inflar dependências: **Resend** (API HTTP simples, `fetch` puro, sem SDK — recomendado), SendGrid (similar, plano grátis menor), ou SMTP de um Gmail/Workspace (exige `nodemailer`, única dependência nova do projeto). Precisa de uma API key do provedor escolhido.
2. **Google Sheets API** — precisa de uma conta de serviço do Google Cloud (arquivo de credencial, não é login/senha do Ivã) com a Sheets API habilitada, e uma planilha nova compartilhada com o e-mail dessa conta de serviço. A chave fica como variável de ambiente no Railway, nunca no repositório.
3. **Conta no Railway** — para o deploy 24h (D44). Criação de conta e configuração de billing são ações que o Ivã precisa fazer (não é algo que se automatiza por código).

## Segurança (não pular)

- **Assinatura do webhook**: Hotmart manda um `hottok` no payload — validar sempre, senão qualquer um pode fabricar um "pedido pago" falso e gerar relatório de graça.
- **Verificação manual do comprador**: já que não há token por pedido, o Ivã confere `email_compra`/`telefone_compra` contra a Hotmart antes de aprovar — é a mitigação atual (ver "O que mudou", item 2).
- **Rate limit** em `/webhook/hotmart` e `/enviar-dados/:produto/dados` — já estava listado como pendência geral do backend (`FASE4_PRODUTO.md`), fica ainda mais importante com rota pública.

## Ordem de construção sugerida

1. ~~**Rota `/enviar-dados/:produto/dados` + gravação na planilha**~~ — ✅ implementado (`app/server.mjs`). Grava a linha via `gravarPedidoNaPlanilha` (pula com aviso no console se `GOOGLE_SHEET_ID`/`GOOGLE_SERVICE_ACCOUNT_KEY_PATH` não estiverem configurados — não bloqueia o resto).
2. ~~**Geração automática ao submeter o formulário**~~ — ✅ implementado, reaproveitando `montarLeitura`/`gerarRelatorioLLM` e um novo helper `gerarPdfBuffer` (usado também pela nova rota `/pdf-sinastria`, que fecha a pendência do `REDTEAM_STATUS.md` item 2).
3. ~~**E-mail de aprovação pro Ivã + rota de aprovar**~~ — ✅ implementado (`enviarEmail` via Resend, rota `GET /pedidos/:id/aprovar`). Testado localmente sem `RESEND_API_KEY`/planilha configuradas: PDF gerado corretamente, e-mail/planilha pulados com aviso, sem quebrar o fluxo.
4. **Webhook real da Hotmart** — ainda não implementado. Próximo passo depois de validar 1–3 com credenciais reais.
5. **Envio final ao cliente** — código pronto (dentro da rota de aprovação), falta testar com `RESEND_API_KEY` real.
6. **Deploy no Railway** (D44) — pendente, precisa da conta criada pelo Ivã.

## Não muda em nada

Prompts (`leitura_individual.md`, `leitura_premium.md`, `sinastria.md`), motor de cálculo, geradores de PDF (`gerar_pdf.py`, `build_pdf.py`) — zero alteração. Essa fase só adiciona orquestração em volta do que já é aprovado e testado.
