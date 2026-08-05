/**
 * Bitna Saju — validação da distribuição das faixas de harmonia da Sinastria
 * (item 6 do checklist de red team, ver REDTEAM_STATUS.md).
 *
 * Roda o algoritmo de compatibilidade sobre uma amostra grande e diversa de
 * pares (300 mapas reais × amostragem de pares, ~15 mil combinações) e
 * reporta a distribuição por faixa + histograma do score bruto. Rodar de
 * novo sempre que os limiares ou a fórmula de score mudarem, pra confirmar
 * que as 4 faixas continuam todas alcançáveis (uma faixa que nunca aparece
 * é uma faixa que não existe).
 *
 * Requer o motor compilado: `npm run build` antes de rodar.
 * Uso: node scripts/validar_distribuicao_faixas.mjs
 */
process.env.TZ = 'Asia/Seoul';

const { calculateSaju } = await import('../dist/lib/saju.js');
const { checkCompatibility } = await import('../dist/lib/compatibility.js');

// Gera um conjunto diverso de mapas reais (não sintéticos) variando data,
// hora e cidade — cobre os 10 Mestres do Dia e uma boa variação de ramos/
// elementos/dez-deuses naturalmente, do jeito que clientes reais apareceriam.
const cidades = ['São Paulo', 'Salvador', 'Recife', 'Manaus', 'Porto Alegre'];
const mapas = [];
let dia = new Date(Date.UTC(1970, 0, 1));
const passoDias = 11; // primo com o ciclo de 10 dias do tronco e 12 do ramo -> boa cobertura
for (let i = 0; i < 300; i++) {
  const dataStr = dia.toISOString().slice(0, 10);
  const hora = String((i * 7) % 24).padStart(2, '0') + ':00';
  const cidade = cidades[i % cidades.length];
  const genero = i % 2 === 0 ? 'male' : 'female';
  try {
    mapas.push(calculateSaju(dataStr, hora, 'solar', false, genero, cidade));
  } catch (e) {
    // pula datas que o motor rejeitar (ex.: fora da tabela lunar)
  }
  dia = new Date(dia.getTime() + passoDias * 86400000);
}
console.log(`mapas gerados: ${mapas.length}`);

// Faixas em uso hoje (app/pdf/sinastria/build_sinastria.py)
function faixa(score) {
  if (score >= 78) return 'Natural';
  if (score >= 62) return 'Consciente';
  if (score >= 46) return 'Crescimento';
  return 'Desafiadora';
}

const contagem = { Natural: 0, Consciente: 0, Crescimento: 0, Desafiadora: 0 };
const scores = [];
let pares = 0;
const passoAmostra = 3; // amostra pares em vez de todos os N² (300*300/2 seria pesado)
for (let i = 0; i < mapas.length; i += 1) {
  for (let j = i + 1; j < mapas.length; j += passoAmostra) {
    const r = checkCompatibility(mapas[i], mapas[j]);
    const s = r.compatibilityScore;
    scores.push(s);
    contagem[faixa(s)]++;
    pares++;
  }
}

console.log(`pares avaliados: ${pares}`);
console.log('\ndistribuição por faixa:');
for (const [nome, n] of Object.entries(contagem)) {
  const pct = ((n / pares) * 100).toFixed(1);
  console.log(`  ${nome.padEnd(12)} ${String(n).padStart(6)}  (${pct}%)`);
}

scores.sort((a, b) => a - b);
const pct = (p) => scores[Math.floor(p * scores.length)];
console.log('\npercentis do score bruto (0-100):');
console.log(`  min=${scores[0]} p10=${pct(0.10)} p25=${pct(0.25)} p50=${pct(0.50)} p75=${pct(0.75)} p90=${pct(0.90)} max=${scores[scores.length - 1]}`);

// histograma simples de 5 em 5 pontos
console.log('\nhistograma (largura 5):');
const hist = {};
for (const s of scores) {
  const bucket = Math.floor(s / 5) * 5;
  hist[bucket] = (hist[bucket] || 0) + 1;
}
const buckets = Object.keys(hist).map(Number).sort((a, b) => a - b);
const maxCount = Math.max(...Object.values(hist));
for (const b of buckets) {
  const n = hist[b];
  const barLen = Math.round((n / maxCount) * 50);
  console.log(`  ${String(b).padStart(3)}-${String(b + 4).padStart(3)}  ${'#'.repeat(barLen)} ${n}`);
}

// Propostas de recalibração (não aplicadas — só simuladas aqui pra comparar).
// Cada esquema é [limiar Crescimento, limiar Consciente, limiar Natural].
function simular(nome, limiares) {
  const [lc, lco, ln] = limiares;
  const c2 = { Natural: 0, Consciente: 0, Crescimento: 0, Desafiadora: 0 };
  for (const s of scores) {
    if (s >= ln) c2.Natural++;
    else if (s >= lco) c2.Consciente++;
    else if (s >= lc) c2.Crescimento++;
    else c2.Desafiadora++;
  }
  const linha = Object.entries(c2)
    .map(([n, v]) => `${n} ${((v / scores.length) * 100).toFixed(0)}%`)
    .join(' · ');
  console.log(`  ${nome.padEnd(28)} [${lc}, ${lco}, ${ln}]  →  ${linha}`);
}

console.log('\npropostas de recalibração (simuladas, nada aplicado):');
simular('atual (build_sinastria.py)', [46, 62, 78]);
simular('quartis exatos (25/25/25/25)', [51, 56, 61]);
simular('meio-termo (~15/35/35/15)', [48, 56, 64]);

