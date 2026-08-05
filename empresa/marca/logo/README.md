# Logotipo aprovado — Bitna Saju

Peças de logotipo aprovadas pelo Ivã (03/08/2026), estrutura BITNA/SAJU/selo 빛나 conforme D23.

- `logo_area_de_respiro.png` — espaço livre e área de proteção, uso correto/incorreto
- `logo_escala_versoes.png` — comparação de escala (aplicação principal vs. compacta)
- `logo_monocromatico.png` — versão de uma única cor
- `logo_vertical_paleta.png` — lockup vertical/empilhado + ficha de paleta e tipografia
- `logo_fundos_principal_reversa_alternativa.png` — versões sobre fundo Hanji White / Soft Charcoal / Seal Red
- `logo_fundos_branco_preto_vermelho.png` — versões sobre branco / preto / vermelho puros
- `logo_hero_branco.png`, `logo_hero_preto_metalico.png` — peças de destaque (hero)
- `logo_vetorizado.svg` — **versão vetorial oficial** (item 8 do checklist de red team, 05/08/2026). Texto convertido em curvas reais (Playfair Display 500 para BITNA, Inter 300 para SAJU, Noto Serif KR 700 para o selo 빛나) — zero dependência de fonte instalada no dispositivo que renderiza. Estrutura/cores/grid vieram do SVG fornecido pelo Ivã (`gemini-svg.svg`, ainda com `<text>` vivo, não vetorizado de verdade apesar do nome). Use este arquivo em qualquer lugar que hoje renderize `빛나` como texto (ex.: `Site/bitna-saju-index.html`), pra eliminar o risco de "tofu" em dispositivo sem fonte coreana.

**Atenção**: a ficha de cores dentro de `logo_vertical_paleta.png` (rótulo "BLACK #000000 / HANKO RED #B71C1C") reflete a paleta de 2 cores do Brandbook V1, já abandonada — ver `../DECISOES.md` D24. A paleta oficial de 6 cores está em `../VISUAL_LANGUAGE.md`. O logotipo em si (estrutura, tipografia, selo) está aprovado; só essa legenda específica dentro da imagem está desatualizada.
