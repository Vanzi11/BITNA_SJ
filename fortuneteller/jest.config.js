// Precisa ser setado aqui (não só em setupFiles): o V8 cacheia o fuso horário
// resolvido na primeira chamada a Date/Intl do processo, e setupFiles roda
// DENTRO do worker do Jest, que pode já ter tocado Date/Intl no próprio
// bootstrap antes do setupFiles executar. Setar aqui, no jest.config.js,
// roda no processo principal do Jest ANTES de criar os workers — os workers
// herdam a env var já correta desde o nascimento do processo.
process.env.TZ = 'Asia/Seoul';

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
