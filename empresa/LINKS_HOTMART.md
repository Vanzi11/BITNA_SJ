# Links de Checkout Hotmart — Referência Oficial

> Registrado em 04/09/2026. Fonte: verificação direta de cada URL (título, preço e produtor renderizados na própria página de checkout, sem login). Estes são os links reais em produção — já embutidos em `Site/leitura-essencial/index.html`, `Site/leitura-completa/index.html`, `Site/sinastria-amorosa/index.html` e `Site/sinastria-profissional/index.html`.

## Links

| Produto | Link de checkout | Preço à vista | Parcelado | Produtor Hotmart |
|---|---|---|---|---|
| 🌿 Leitura Essencial | https://pay.hotmart.com/W107150759Q?off=euwcjgfa | R$ 47,60 | — (só à vista) | Bitna Saju |
| ⭐ Leitura Completa | https://pay.hotmart.com/U107153331N | R$ 149,30 | 10x R$ 17,94 (total R$ 179,40) | Bitna Saju |
| 💞 Sinastria Amorosa | https://pay.hotmart.com/C107154253T?off=tsghzdua&bid=1788529838489 | R$ 98,00 | 10x R$ 11,78 (total R$ 117,80) | Bitna Saju |
| 🤝 Sinastria Profissional | https://pay.hotmart.com/C107154012M | R$ 98,00 | 10x R$ 11,78 (total R$ 117,80) | Bitna Saju |

## Conferência com `EMPRESA.md`

Preços batem exatamente com os registrados em `empresa/EMPRESA.md` v1.2 (D45/D53): Essencial R$ 47,60, Completa R$ 149,30 (promoção encerrada, D53), Sinastrias R$ 98,00. Nenhuma correção de preço foi necessária.

## ✅ RESOLVIDO (18/09/2026) — produtor divergente nas Sinastrias

As duas páginas de Sinastria apareciam no checkout como vendidas por **"12.726.385 VALDIR ANTONIO SANTOS"** (nome de pessoa física), enquanto Essencial e Completa apareciam como **"Bitna Saju"** — mesmo sendo, na verdade, a mesma conta Hotmart (confirmado por inspeção direta em `app.hotmart.com/products/producer`: os 4 produtos, incluindo as 2 cópias de rascunho da Sinastria, estão sob a mesma conta, e-mail do Ivã). Não era conta diferente nem produtor de fato divergente — só o nome exibido no checkout, corrigido via chamado ao suporte da Hotmart. Conferido em 18/09/2026 direto nas 4 páginas públicas de checkout: as 4 mostram "Autor: Bitna Saju", e o texto legal do checkout da Sinastria Amorosa já declara "a Hotmart está processando este pedido em nome de Bitna Saju" — é o campo que realmente importa (a declaração da transação), não só um rótulo cosmético.

**Achado à parte, sem risco imediato:** existem cópias em "Em rascunho" duplicadas de Sinastria Amorosa e Sinastria Profissional na lista de produtos, ao lado das versões ativas — limpeza pendente, não afeta nada em produção.
