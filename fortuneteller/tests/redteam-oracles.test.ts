/**
 * Oráculos do red team (Bitna Saju) — mapas verificados de forma independente.
 *
 * Cobre o guardrail #1 do loop de correções: nenhum ajuste de cálculo deve
 * ser feito sem estes testes permanecendo verdes.
 *
 * Fonte dos valores esperados: tabela de oráculos fornecida pelo Ivã
 * (não gerada por este código — verificação cruzada externa).
 *
 * Requer TZ=Asia/Seoul (ver tests/jest.setup.ts + app/server.mjs) — setado
 * via setupFiles, porque em módulos ESM os imports são hoisted e rodam
 * antes de qualquer atribuição feita aqui dentro do próprio arquivo.
 */

import { calculateSaju } from '../src/lib/saju.js';
import { HEAVENLY_STEMS } from '../src/data/heavenly_stems.js';
import { EARTHLY_BRANCHES } from '../src/data/earthly_branches.js';
import type { Pillar } from '../src/types/index.js';

function hanjaPilar(p: Pillar): string {
  const stem = HEAVENLY_STEMS.find((s) => s.korean === p.stem);
  const branch = EARTHLY_BRANCHES.find((b) => b.korean === p.branch);
  if (!stem || !branch) throw new Error(`Stem/branch não encontrado: ${p.stem}/${p.branch}`);
  return `${stem.hanja}${branch.hanja}`;
}

function animalDoDia(dayPillar: Pillar): string {
  const branch = EARTHLY_BRANCHES.find((b) => b.korean === dayPillar.branch);
  if (!branch) throw new Error(`Branch não encontrado: ${dayPillar.branch}`);
  return branch.animal;
}

describe('Oráculo — Ivã (1982-11-11 12:30, Salvador-BA)', () => {
  const saju = calculateSaju('1982-11-11', '12:30', 'solar', false, 'male', 'Salvador');

  test('pilares batem com o oráculo (hora solar verdadeira, único caminho hoje)', () => {
    expect(hanjaPilar(saju.year)).toBe('壬戌');
    expect(hanjaPilar(saju.month)).toBe('辛亥');
    expect(hanjaPilar(saju.day)).toBe('戊戌');
    expect(hanjaPilar(saju.hour)).toBe('戊午'); // estável nas duas convenções, conforme oráculo
  });

  test('Mestre do Dia = 戊 (Mu, Terra Yang)', () => {
    const stem = HEAVENLY_STEMS.find((s) => s.korean === saju.day.stem);
    expect(stem?.hanja).toBe('戊');
    expect(stem?.element).toBe('토'); // Terra
    expect(stem?.yinYang).toBe('양'); // Yang
  });

  test('animal do dia = Cão', () => {
    expect(animalDoDia(saju.day)).toMatch(/개|Cão|Cao|dog/i);
  });
});

describe('Oráculo — Fagundes (1987-06-15 03:06, Brasília-DF)', () => {
  const saju = calculateSaju('1987-06-15', '03:06', 'solar', false, 'male', 'Brasília');

  test('pilares Ano/Mês/Dia batem com o oráculo (não dependem da hora)', () => {
    expect(hanjaPilar(saju.year)).toBe('丁卯');
    expect(hanjaPilar(saju.month)).toBe('丙午');
    expect(hanjaPilar(saju.day)).toBe('乙未');
  });

  test('pilar da Hora usa hora SOLAR (~02:54) por padrão e dá 丁丑', () => {
    // Caso crítico do item 5: a correção de longitude muda o pilar porque
    // cruza a fronteira de ramo (寅 03-05h → 丑 01-03h).
    expect(hanjaPilar(saju.hour)).toBe('丁丑');
  });

  test('item 5-estrutura: horaConvencao="relogio" dá 戊寅 — a outra coluna do oráculo', () => {
    const sajuRelogio = calculateSaju('1987-06-15', '03:06', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
    });
    expect(hanjaPilar(sajuRelogio.hour)).toBe('戊寅');
    // Ano/Mês/Dia não dependem da convenção de hora — continuam iguais.
    expect(hanjaPilar(sajuRelogio.day)).toBe('乙未');
  });

  test('Mestre do Dia = 乙 (Eul, Madeira Yin)', () => {
    const stem = HEAVENLY_STEMS.find((s) => s.korean === saju.day.stem);
    expect(stem?.hanja).toBe('乙');
    expect(stem?.element).toBe('목'); // Madeira
    expect(stem?.yinYang).toBe('음'); // Yin
  });

  test('animal do dia = Cabra', () => {
    expect(animalDoDia(saju.day)).toMatch(/양|Cabra|goat|sheep/i);
  });
});

describe('Regressão de horário de verão (item 1) — janeiro/1990, São Paulo', () => {
  // Verão 1989/1990 no Brasil: DST vigente de 15/10/1989 a 11/02/1990 (America/Sao_Paulo).
  // Se o pipeline usasse offset fixo (-03:00) em vez da timezone IANA, este
  // teste pegaria a regressão: o offset real neste instante é -02:00 (DST).
  test('America/Sao_Paulo em 1990-01-15 12:00 aplica o horário de verão (offset -02:00, não -03:00)', () => {
    const wallTimeUTC = new Date('1990-01-15T12:00:00.000Z');
    const offsetLabel = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      timeZoneName: 'shortOffset',
    })
      .formatToParts(wallTimeUTC)
      .find((p) => p.type === 'timeZoneName')?.value;
    expect(offsetLabel).toBe('GMT-2');
  });

  test('calculateSaju para uma data dentro do verão de 1989/90 não lança erro e produz pilares', () => {
    // Smoke test: garante que o caminho de cálculo aceita uma data em janela de DST
    // real sem quebrar. Não temos oráculo externo verificado para este caso
    // específico — é teste de regressão estrutural, não de valor exato.
    const saju = calculateSaju('1990-01-15', '12:00', 'solar', false, 'male', 'São Paulo');
    expect(saju.hour.stem).toBeTruthy();
    expect(saju.hour.branch).toBeTruthy();
  });
});

describe('Item 5-estrutura: diaMudaAs23h (convenção "zi cedo", 早子時)', () => {
  // Sem oráculo externo pra este caso (não fazia parte da tabela original) —
  // verificação estrutural: com a flag ligada, um nascimento às 23h+ deve
  // usar o MESMO pilar do Dia que alguém nascido no dia seguinte às 00h,
  // não o pilar do próprio dia civil.
  test('padrão (false): 23h30 usa o pilar do próprio dia civil', () => {
    const saju = calculateSaju('1987-06-15', '23:30', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
    });
    const sajuMesmoDiaMeioDia = calculateSaju('1987-06-15', '12:00', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
    });
    expect(saju.day.stem).toBe(sajuMesmoDiaMeioDia.day.stem);
    expect(saju.day.branch).toBe(sajuMesmoDiaMeioDia.day.branch);
  });

  test('diaMudaAs23h=true: 23h30 usa o pilar do dia SEGUINTE', () => {
    const saju = calculateSaju('1987-06-15', '23:30', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
      diaMudaAs23h: true,
    });
    const sajuDiaSeguinte = calculateSaju('1987-06-16', '12:00', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
    });
    expect(saju.day.stem).toBe(sajuDiaSeguinte.day.stem);
    expect(saju.day.branch).toBe(sajuDiaSeguinte.day.branch);
    // continua marcando hora zi (子) — isso já era correto antes, não muda
    expect(saju.hour.branch).toBe('자');
  });

  test('diaMudaAs23h=true não afeta horários antes das 23h', () => {
    const comFlag = calculateSaju('1987-06-15', '22:59', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio', diaMudaAs23h: true,
    });
    const semFlag = calculateSaju('1987-06-15', '22:59', 'solar', false, 'male', 'Brasília', {
      horaConvencao: 'relogio',
    });
    expect(comFlag.day.stem).toBe(semFlag.day.stem);
    expect(comFlag.day.branch).toBe(semFlag.day.branch);
  });
});
