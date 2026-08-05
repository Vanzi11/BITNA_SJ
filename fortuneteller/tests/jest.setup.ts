// Requisito do motor (ver app/server.mjs) — o pipeline de pilares depende do
// fuso local do processo (calculateDayPillar usa differenceInCalendarDays,
// que lê o calendário via TZ do sistema). Precisa ser setado ANTES de
// qualquer import de módulo que toque data/hora, por isso vive em
// `setupFiles` (roda antes do arquivo de teste, inclusive antes dos
// imports dele serem executados — diferente de um "beforeAll" comum).
process.env.TZ = 'Asia/Seoul';
