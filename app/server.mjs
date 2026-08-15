#!/usr/bin/env node
/**
 * Bitna Saju — backend HTTP (Fase 4 + Fase 5)
 *
 * Endpoints:
 *   GET  /                          → UI de teste
 *   GET  /cidades?q=...             → autocomplete de cidades brasileiras
 *   POST /leitura                   → { data, hora?, cidade, sexo, gerarRelatorio? }
 *   POST /sinastria                 → { pessoa1: {...}, pessoa2: {...}, gerarRelatorio? }
 *   POST /diaria                    → { data, hora, cidade, sexo, alvo }
 *   POST /pdf                       → gera PDF Essencial/Completa
 *   POST /pdf-sinastria             → gera PDF de Sinastria (Amorosa/Profissional)
 *   POST /enviar-dados/:produto/dados → destino dos 4 formulários estáticos (Site/enviar-dados/)
 *   GET  /pedidos/:id/aprovar       → link de aprovação de 1 clique (e-mail do Ivã)
 *
 * Sem dependências externas (Node >= 18). Se ANTHROPIC_API_KEY estiver
 * definida e gerarRelatorio=true, o relatório narrativo é gerado via API.
 * Fase 5 (e-mail via Resend, painel via Google Sheets) é opcional: sem as
 * variáveis de ambiente correspondentes (ver app/.env.example), o servidor
 * ainda funciona — só pula o envio/gravação e registra no console.
 */
process.env.TZ = 'Asia/Seoul'; // requisito do motor (ver docs/FASE1_FUSO_BRASIL.md)

import { createServer } from 'http';
import { readFileSync, writeFileSync, readFileSync as lerArquivo, unlinkSync, existsSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { randomUUID, createSign } from 'crypto';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENGINE = process.env.SAJU_ENGINE_DIST ?? join(HERE, '../fortuneteller/dist');
const PROMPTS = process.env.SAJU_PROMPTS ?? join(HERE, '../relatorios/prompts');
const PORT = parseInt(process.env.PORT ?? '3333', 10);
const MODELO = process.env.SAJU_LLM_MODEL ?? 'claude-sonnet-5';

// Fase 5: guarda PDF + metadados enquanto um pedido aguarda a aprovação do Ivã
// (a planilha é o painel de status; isto aqui é só o elo técnico entre o clique
// de aprovação e o PDF/e-mail do cliente certos — ver docs/FASE5_AUTOMACAO_VENDAS.md)
const PEDIDOS_DIR = process.env.PEDIDOS_DIR ?? join(HERE, 'pedidos_pendentes');
if (!existsSync(PEDIDOS_DIR)) mkdirSync(PEDIDOS_DIR, { recursive: true });

// No Windows, import() dinâmico exige URL file:// — pathToFileURL resolve nas duas plataformas
const importEngine = (rel) => import(pathToFileURL(join(ENGINE, rel)).href);

const { calculateSaju } = await importEngine('lib/saju.js');
const { calculateDaeUn } = await importEngine('lib/dae_un.js');
const { checkCompatibility } = await importEngine('lib/compatibility.js');
const { getDailyFortune } = await importEngine('lib/fortune.js');
const { BRAZIL_CITIES, normalizeBrazilCityName } = await importEngine('data/brazil_cities.js');
const { traduzirSaju, traduzirDiaria, ELEMENTOS_PT, TRONCOS_PT, RAMOS_PT } =
  await importEngine('data/i18n/pt_br.js');

const promptIndividual = readFileSync(join(PROMPTS, 'leitura_individual.md'), 'utf8');
const promptSinastria = readFileSync(join(PROMPTS, 'sinastria.md'), 'utf8');
const promptPremium = readFileSync(join(PROMPTS, 'leitura_premium.md'), 'utf8');
const indexHtml = readFileSync(join(HERE, 'public/index.html'), 'utf8');

function traduzirDaeUn(periods) {
  return periods.slice(0, 10).map((p) => ({
    faixaEtaria: `${p.startAge}–${p.endAge} anos`,
    ganji: p.stem + p.branch,
    tronco: `${TRONCOS_PT[p.stem]?.romanizacao ?? p.stem} — ${ELEMENTOS_PT[p.stemElement] ?? p.stemElement}`,
    ramo: `${RAMOS_PT[p.branch]?.romanizacao ?? p.branch} — ${ELEMENTOS_PT[p.branchElement] ?? p.branchElement}` +
      (RAMOS_PT[p.branch] ? ` (${RAMOS_PT[p.branch].animal})` : ''),
  }));
}

// Nome de arquivo padronizado Tipo_Nome_Versao_Ano (D31, regra 1)
// Nome = primeiro nome completo + iniciais do meio + último nome completo, sem acento.
// Ex.: 'Ivã Márcio Rego Santos' -> 'IvaMRSantos'.
const DOC_VERSION = 'V3';
const IGNORAR_NOME = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
const slugNome = (nome) => {
  const parts = (nome || '').split(/\s+/).filter((p) => p && !IGNORAR_NOME.has(p.toLowerCase()));
  if (!parts.length) return 'XX';
  const base = parts.length === 1
    ? parts[0]
    : parts[0] + parts.slice(1, -1).map((p) => p[0]).join('') + parts[parts.length - 1];
  return base.normalize('NFD').replace(/[̀-ͯ]/g, '') || 'XX';
};
const nomeArquivo = (nome, premium) =>
  `${premium ? 'Completa' : 'Essencial'}_${slugNome(nome)}_${DOC_VERSION}_${new Date().getFullYear()}`;

function montarLeitura({ data, hora, cidade, sexo }) {
  const horaDesconhecida = !hora;
  const horaEfetiva = hora || '12:00';
  const saju = calculateSaju(data, horaEfetiva, 'solar', false, sexo, cidade);
  const leitura = traduzirSaju(saju);
  leitura.ciclosDeDecada = traduzirDaeUn(calculateDaeUn(saju));
  // Sigla do estado de nascimento, para a capa exibir "Cidade - UF" (D30, regra 1)
  const infoCidade = BRAZIL_CITIES.find((cc) => normalizeBrazilCityName(cc.name) === normalizeBrazilCityName(cidade));
  if (infoCidade?.state) leitura.nascimento.uf = infoCidade.state;
  if (horaDesconhecida) {
    // 3 pilares: sem hora confiável, o pilar da hora é omitido
    delete leitura.pilares.hora;
    leitura.horaDesconhecida = true;
    leitura.nascimento.hora = 'desconhecida';
  }
  return { saju, leitura };
}

async function gerarRelatorioLLM(system, user) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 4000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`API LLM: HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.content?.[0]?.text ?? null;
}

const montarUser = (dados) =>
  'Gere o relatório a partir destes dados calculados:\n\n```json\n' +
  JSON.stringify(dados, null, 2) + '\n```';

// ---------- Fase 5: geração de PDF reutilizável (Essencial/Completa/Sinastria) ----------
async function gerarPdfBuffer(script, payload) {
  const sufixo = `${Date.now()}_${randomUUID()}`;
  const entrada = join(tmpdir(), `saju_pdf_${sufixo}.json`);
  const saida = join(tmpdir(), `saju_pdf_${sufixo}.pdf`);
  writeFileSync(entrada, JSON.stringify(payload));
  const py = process.platform === 'win32' ? 'python' : 'python3';
  await new Promise((ok, ruim) => {
    const pr = spawn(py, [script, entrada, saida]);
    let err = ''; pr.stderr.on('data', (d) => { err += d; });
    pr.on('close', (cod) => (cod === 0 ? ok() : ruim(new Error('gerar_pdf: ' + err.slice(0, 400)))));
  });
  const pdf = lerArquivo(saida);
  try { unlinkSync(entrada); unlinkSync(saida); } catch {}
  return pdf;
}

// ---------- Fase 5: e-mail via Resend (API HTTP simples, sem SDK) ----------
async function enviarEmail({ to, subject, html, attachments }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log(`[e-mail pulado — RESEND_API_KEY ausente] para=${to} assunto="${subject}"`); return; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: process.env.EMAIL_REMETENTE || 'Bitna Saju <contato@bitnasaju.com.br>',
      to: [to],
      subject,
      html,
      attachments,
    }),
  });
  if (!res.ok) throw new Error(`Resend: HTTP ${res.status}: ${await res.text()}`);
}

// ---------- Fase 5: Google Sheets via conta de serviço (JWT assinado à mão, sem SDK) ----------
const base64url = (input) =>
  Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

let tokenGoogleCache = { token: null, exp: 0 };

async function tokenGoogle() {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyPath) return null;
  const agora = Math.floor(Date.now() / 1000);
  if (tokenGoogleCache.token && tokenGoogleCache.exp - 60 > agora) return tokenGoogleCache.token;
  const cred = JSON.parse(readFileSync(keyPath, 'utf8'));
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: cred.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: agora,
    exp: agora + 3600,
  }));
  const semAssinar = `${header}.${claims}`;
  const assinatura = base64url(createSign('RSA-SHA256').update(semAssinar).sign(cred.private_key));
  const jwt = `${semAssinar}.${assinatura}`;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  if (!res.ok) throw new Error(`Autenticação Google: HTTP ${res.status}: ${await res.text()}`);
  const json2 = await res.json();
  tokenGoogleCache = { token: json2.access_token, exp: agora + json2.expires_in };
  return json2.access_token;
}

// Colunas da planilha "Pedidos": A carimbo · B produto · C e-mail compra · D telefone compra ·
// E nome · F data nasc. · G hora nasc. · H cidade nasc. · I país nasc. · J tipo de relação ·
// K status · L observações — status fica na coluna K (índice 10).
async function gravarPedidoNaPlanilha(linha) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const token = await tokenGoogle();
  if (!sheetId || !token) { console.log('[planilha pulada — Google Sheets não configurado]'); return null; }
  const aba = process.env.GOOGLE_SHEET_ABA || 'Pedidos';
  const range = encodeURIComponent(`${aba}!A:A`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ values: [linha] }) },
  );
  if (!res.ok) throw new Error(`Google Sheets: HTTP ${res.status}: ${await res.text()}`);
  const json2 = await res.json();
  return json2.updates?.updatedRange || null; // ex.: "Pedidos!A5:L5" — guardado pra atualizar o status depois
}

async function atualizarStatusNaPlanilha(range, status) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const token = await tokenGoogle();
  const numeroLinha = range?.match(/(\d+)/)?.[1];
  if (!sheetId || !token || !numeroLinha) return;
  const aba = process.env.GOOGLE_SHEET_ABA || 'Pedidos';
  const celula = encodeURIComponent(`${aba}!K${numeroLinha}`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${celula}?valueInputOption=USER_ENTERED`,
    { method: 'PUT', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ values: [[status]] }) },
  );
  if (!res.ok) throw new Error(`Google Sheets (status): HTTP ${res.status}: ${await res.text()}`);
}

async function lerBodyForm(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

const paginaConfirmacao = (titulo, mensagem) => `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} | Bitna Saju</title>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400&family=Work+Sans:wght@400&display=swap" rel="stylesheet">
<style>
  body{margin:0; background:#F7F4EE; color:#24211E; font-family:'Work Sans',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px;}
  .box{max-width:480px; text-align:center;}
  h1{font-family:'Newsreader',serif; font-weight:400; font-size:28px; margin-bottom:16px;}
  p{font-size:15px; line-height:1.7; color:#4d473f;}
  a{color:#A67C52;}
</style></head>
<body><div class="box"><h1>${titulo}</h1><p>${mensagem}</p></div></body></html>`;

async function lerBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

const json = (res, code, obj) => {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(JSON.stringify(obj, null, 2));
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(indexHtml);
    }

    if (req.method === 'GET' && url.pathname === '/cidades') {
      const q = normalizeBrazilCityName(url.searchParams.get('q') ?? '');
      const lista = BRAZIL_CITIES
        .filter((c) => !q || normalizeBrazilCityName(c.name).includes(q))
        .slice(0, 15)
        .map((c) => ({ nome: c.name, uf: c.state }));
      return json(res, 200, lista);
    }

    if (req.method === 'POST' && url.pathname === '/leitura') {
      const b = await lerBody(req);
      if (!b.data || !b.cidade || !b.sexo) return json(res, 400, { erro: 'Campos obrigatórios: data, cidade, sexo (hora é opcional)' });
      const { leitura } = montarLeitura(b);
      const idade = new Date().getFullYear() - parseInt(b.data.slice(0, 4), 10);
      const premium = b.produto === 'premium';
      const dados = { nome: b.nome || undefined, idadeAproximada: idade, ...leitura };
      if (premium && b.tipoSanguineo) dados.tipoSanguineo = b.tipoSanguineo;
      const sys = premium ? promptPremium : promptIndividual;
      const user = montarUser(dados);
      const resposta = { leitura, produto: premium ? 'premium' : 'essencial', llmDisponivel: !!process.env.ANTHROPIC_API_KEY, prompt: { system: sys, user } };
      if (b.gerarRelatorio) resposta.relatorio = await gerarRelatorioLLM(sys, user);
      return json(res, 200, resposta);
    }

    if (req.method === 'POST' && url.pathname === '/sinastria') {
      const b = await lerBody(req);
      if (!b.pessoa1 || !b.pessoa2) return json(res, 400, { erro: 'Campos obrigatórios: pessoa1, pessoa2' });
      const p1 = montarLeitura(b.pessoa1);
      const p2 = montarLeitura(b.pessoa2);
      const compat = checkCompatibility(p1.saju, p2.saju);
      const tiposValidos = ['amorosa', 'societaria', 'amizade', 'familiar'];
      const tipoRelacao = tiposValidos.includes(b.tipoRelacao) ? b.tipoRelacao : 'amorosa';
      const dados = {
        tipoRelacao,
        pessoa1: { nome: b.pessoa1.nome || undefined, ...p1.leitura },
        pessoa2: { nome: b.pessoa2.nome || undefined, ...p2.leitura },
        analiseMotor: { score: compat.compatibilityScore, harmoniaElemental: compat.elementHarmony?.harmony },
      };
      const user = montarUser(dados);
      const resposta = { dados, llmDisponivel: !!process.env.ANTHROPIC_API_KEY, prompt: { system: promptSinastria, user } };
      if (b.gerarRelatorio) resposta.relatorio = await gerarRelatorioLLM(promptSinastria, user);
      return json(res, 200, resposta);
    }

    if (req.method === 'POST' && url.pathname === '/diaria') {
      const b = await lerBody(req);
      if (!b.data || !b.hora || !b.cidade || !b.sexo) return json(res, 400, { erro: 'Campos obrigatórios: data, hora, cidade, sexo (alvo opcional = hoje)' });
      const saju = calculateSaju(b.data, b.hora, 'solar', false, b.sexo, b.cidade);
      const alvo = b.alvo ?? new Date().toISOString().slice(0, 10);
      return json(res, 200, { diaria: traduzirDiaria(getDailyFortune(saju, alvo)) });
    }

    if (req.method === 'POST' && url.pathname === '/pdf') {
      const b = await lerBody(req);
      if (!b.data || !b.cidade || !b.sexo) return json(res, 400, { erro: 'Campos obrigatórios: data, cidade, sexo' });
      const { leitura } = montarLeitura(b);
      const premium = b.produto === 'premium';
      const idade = new Date().getFullYear() - parseInt(b.data.slice(0, 4), 10);
      const dados = { nome: b.nome || undefined, idadeAproximada: idade, ...leitura };
      if (premium && b.tipoSanguineo) dados.tipoSanguineo = b.tipoSanguineo;
      let relatorio = b.relatorio ?? null; // texto pronto pode ser enviado (fluxo com revisão humana)
      if (!relatorio && b.gerarRelatorio) {
        relatorio = await gerarRelatorioLLM(premium ? promptPremium : promptIndividual, montarUser(dados));
      }
      const entrada = join(tmpdir(), `saju_pdf_${Date.now()}.json`);
      const saida = join(tmpdir(), `saju_pdf_${Date.now()}.pdf`);
      writeFileSync(entrada, JSON.stringify({ produto: premium ? 'premium' : 'essencial', nome: b.nome || null, idadeAproximada: idade, leitura, relatorio }));
      const py = process.platform === 'win32' ? 'python' : 'python3';
      // Visual v5 ("livro de arte de Seul", D9) está parametrizado só para o Premium
      // por enquanto — ver pendência "PDF do Essencial no visual v5" em CONTINUIDADE.md.
      // Essencial continua no gerador v4 até essa tarefa ser feita.
      const script = premium ? join(HERE, 'pdf/premium_v5/build_pdf.py') : join(HERE, 'pdf/gerar_pdf.py');
      await new Promise((ok, ruim) => {
        const pr = spawn(py, [script, entrada, saida]);
        let err = ''; pr.stderr.on('data', d => err += d);
        pr.on('close', cod => cod === 0 ? ok() : ruim(new Error('gerar_pdf: ' + err.slice(0, 400))));
      });
      const pdf = lerArquivo(saida);
      try { unlinkSync(entrada); unlinkSync(saida); } catch {}
      res.writeHead(200, { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${nomeArquivo(b.nome, premium)}.pdf"` });
      return res.end(pdf);
    }

    if (req.method === 'POST' && url.pathname === '/pdf-sinastria') {
      const b = await lerBody(req);
      if (!b.pessoa1 || !b.pessoa2) return json(res, 400, { erro: 'Campos obrigatórios: pessoa1, pessoa2' });
      const p1 = montarLeitura(b.pessoa1);
      const p2 = montarLeitura(b.pessoa2);
      const compat = checkCompatibility(p1.saju, p2.saju);
      const tiposValidos = ['amorosa', 'societaria', 'amizade', 'familiar'];
      const tipoRelacao = tiposValidos.includes(b.tipoRelacao) ? b.tipoRelacao : 'amorosa';
      const dados = {
        tipoRelacao,
        pessoa1: { nome: b.pessoa1.nome || undefined, ...p1.leitura },
        pessoa2: { nome: b.pessoa2.nome || undefined, ...p2.leitura },
        analiseMotor: { score: compat.compatibilityScore, harmoniaElemental: compat.elementHarmony?.harmony },
      };
      let relatorio = b.relatorio ?? null;
      if (!relatorio && b.gerarRelatorio) relatorio = await gerarRelatorioLLM(promptSinastria, montarUser(dados));
      const pdf = await gerarPdfBuffer(join(HERE, 'pdf/sinastria/build_sinastria.py'), { ...dados, relatorio });
      const nomeArq = `Sinastria_${slugNome(b.pessoa1.nome)}_${slugNome(b.pessoa2.nome)}_${new Date().getFullYear()}.pdf`;
      res.writeHead(200, { 'content-type': 'application/pdf', 'content-disposition': `attachment; filename="${nomeArq}"` });
      return res.end(pdf);
    }

    // Fase 5 — destino do <form action> das 4 páginas estáticas em Site/enviar-dados/{produto}/.
    // O produto técnico vem do campo oculto "produto" do próprio formulário (essencial/premium/
    // sinastria_amorosa/sinastria_societaria) — o trecho da URL é só roteamento, não é validado.
    if (req.method === 'POST' && /^\/enviar-dados\/[\w-]+\/dados$/.test(url.pathname)) {
      const b = await lerBodyForm(req);
      if (!b.email_compra || !b.telefone_compra || !b.consentimento) {
        res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(paginaConfirmacao('Faltou preencher algo', 'Volte à página anterior e confira se todos os campos obrigatórios (incluindo o consentimento) foram preenchidos.'));
      }
      const sinastria = ['sinastria_amorosa', 'sinastria_societaria'].includes(b.produto);
      if (sinastria && !b.consentimento_pessoa2) {
        res.writeHead(400, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(paginaConfirmacao('Faltou um consentimento', 'É preciso confirmar a autorização da Pessoa 2 antes de enviar.'));
      }
      const premium = b.produto === 'premium';

      let payloadPdf, scriptPdf, nomeParaEmail, nomeArquivoPdf, linhaPlanilha;
      if (sinastria) {
        const p1 = montarLeitura({ data: b.pessoa1_data, hora: b.pessoa1_hora, cidade: b.pessoa1_cidade, sexo: b.pessoa1_sexo });
        const p2 = montarLeitura({ data: b.pessoa2_data, hora: b.pessoa2_hora, cidade: b.pessoa2_cidade, sexo: b.pessoa2_sexo });
        const compat = checkCompatibility(p1.saju, p2.saju);
        const dados = {
          tipoRelacao: b.tipoRelacao,
          pessoa1: { nome: b.pessoa1_nome, ...p1.leitura },
          pessoa2: { nome: b.pessoa2_nome, ...p2.leitura },
          analiseMotor: { score: compat.compatibilityScore, harmoniaElemental: compat.elementHarmony?.harmony },
        };
        const relatorio = await gerarRelatorioLLM(promptSinastria, montarUser(dados));
        payloadPdf = { ...dados, relatorio };
        scriptPdf = join(HERE, 'pdf/sinastria/build_sinastria.py');
        nomeParaEmail = `${b.pessoa1_nome} & ${b.pessoa2_nome}`;
        nomeArquivoPdf = `Sinastria_${slugNome(b.pessoa1_nome)}_${slugNome(b.pessoa2_nome)}_${new Date().getFullYear()}.pdf`;
        linhaPlanilha = [
          new Date().toISOString(), b.produto, b.email_compra, b.telefone_compra,
          `${b.pessoa1_nome} / ${b.pessoa2_nome}`, b.pessoa1_data, b.pessoa1_hora || '', b.pessoa1_cidade, b.pessoa1_pais || '',
          b.tipoRelacao || '', 'aguardando revisão', '',
        ];
      } else {
        const idade = new Date().getFullYear() - parseInt((b.data || '').slice(0, 4), 10);
        const { leitura } = montarLeitura({ data: b.data, hora: b.hora, cidade: b.cidade, sexo: b.sexo });
        const dados = { nome: b.nome || undefined, idadeAproximada: idade, ...leitura };
        const relatorio = await gerarRelatorioLLM(premium ? promptPremium : promptIndividual, montarUser(dados));
        payloadPdf = { produto: premium ? 'premium' : 'essencial', nome: b.nome || null, idadeAproximada: idade, leitura, relatorio };
        scriptPdf = premium ? join(HERE, 'pdf/premium_v5/build_pdf.py') : join(HERE, 'pdf/gerar_pdf.py');
        nomeParaEmail = b.nome;
        nomeArquivoPdf = `${nomeArquivo(b.nome, premium)}.pdf`;
        linhaPlanilha = [
          new Date().toISOString(), b.produto, b.email_compra, b.telefone_compra,
          b.nome, b.data, b.hora || '', b.cidade, b.pais || '',
          '', 'aguardando revisão', '',
        ];
      }

      const pdf = await gerarPdfBuffer(scriptPdf, payloadPdf);

      const idPedido = randomUUID();
      writeFileSync(join(PEDIDOS_DIR, `${idPedido}.pdf`), pdf);
      writeFileSync(join(PEDIDOS_DIR, `${idPedido}.json`), JSON.stringify({
        produto: b.produto, emailCliente: b.email_compra, nome: nomeParaEmail, nomeArquivoPdf, criadoEm: new Date().toISOString(),
      }));

      let rangePlanilha = null;
      try { rangePlanilha = await gravarPedidoNaPlanilha(linhaPlanilha); }
      catch (e) { console.error('Falha ao gravar na planilha:', e.message); }
      if (rangePlanilha) writeFileSync(join(PEDIDOS_DIR, `${idPedido}.range`), rangePlanilha);

      const base = process.env.BASE_URL || `http://${req.headers.host}`;
      const linkAprovar = `${base}/pedidos/${idPedido}/aprovar`;
      try {
        await enviarEmail({
          to: process.env.EMAIL_IVA || 'contato@bitnasaju.com.br',
          subject: `Novo pedido: ${nomeParaEmail} (${b.produto})`,
          html: `<p>Pedido novo pra revisar.</p><p><b>Produto:</b> ${b.produto}<br><b>Nome:</b> ${nomeParaEmail}<br><b>E-mail da compra:</b> ${b.email_compra}<br><b>Telefone:</b> ${b.telefone_compra}</p><p>Confira o PDF em anexo. Se estiver tudo certo, aprove aqui: <a href="${linkAprovar}">${linkAprovar}</a></p>`,
          attachments: [{ filename: nomeArquivoPdf, content: pdf.toString('base64') }],
        });
      } catch (e) { console.error('Falha ao enviar e-mail de revisão:', e.message); }

      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(paginaConfirmacao('Recebemos seus dados! 🌿', 'Sua leitura já está sendo preparada. Você vai receber o relatório por e-mail assim que a revisão terminar.'));
    }

    // Fase 5 — link de 1 clique no e-mail de revisão do Ivã.
    if (req.method === 'GET' && /^\/pedidos\/[\w-]+\/aprovar$/.test(url.pathname)) {
      const id = url.pathname.split('/')[2];
      const jsonPath = join(PEDIDOS_DIR, `${id}.json`);
      const pdfPath = join(PEDIDOS_DIR, `${id}.pdf`);
      if (!existsSync(jsonPath) || !existsSync(pdfPath)) {
        res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(paginaConfirmacao('Pedido não encontrado', 'Esse link já foi usado ou não existe mais.'));
      }
      const info = JSON.parse(readFileSync(jsonPath, 'utf8'));
      const pdf = lerArquivo(pdfPath);
      try {
        await enviarEmail({
          to: info.emailCliente,
          subject: 'Seu relatório Bitna Saju está pronto ✦',
          html: `<p>Oi! Seu relatório está pronto — segue em anexo.</p><p>"Não é sobre prever sua vida — é sobre entender seus padrões para decidir melhor."</p>`,
          attachments: [{ filename: info.nomeArquivoPdf, content: pdf.toString('base64') }],
        });
      } catch (e) {
        res.writeHead(500, { 'content-type': 'text/html; charset=utf-8' });
        return res.end(paginaConfirmacao('Erro ao enviar', 'A aprovação não conseguiu disparar o e-mail. Tente de novo em alguns minutos ou envie manualmente. Detalhe: ' + e.message));
      }
      const rangePath = join(PEDIDOS_DIR, `${id}.range`);
      if (existsSync(rangePath)) {
        try { await atualizarStatusNaPlanilha(readFileSync(rangePath, 'utf8'), 'enviado'); }
        catch (e) { console.error('Falha ao atualizar planilha:', e.message); }
      }
      try { unlinkSync(jsonPath); unlinkSync(pdfPath); if (existsSync(rangePath)) unlinkSync(rangePath); } catch {}
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(paginaConfirmacao('Aprovado e enviado ✅', `O relatório de ${info.nome} foi enviado pra ${info.emailCliente}.`));
    }

    return json(res, 404, { erro: 'Rota não encontrada' });
  } catch (e) {
    return json(res, 500, { erro: String(e.message ?? e) });
  }
});

server.listen(PORT, () => console.log(`Bitna Saju backend em http://localhost:${PORT}`));
