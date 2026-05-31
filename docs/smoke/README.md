# Smoke test — Meu Acerto genérico

## Post-deploy (2026-05-30) — https://iphonegalaxy.github.io/ACERTO-DE-CONTAS/

| # | Teste | Resultado |
|---|-------|-----------|
| 01 | App carrega sem erro de Firebase | PASS |
| 02 | Tela "Criar nova família" / "Entrar com código" | PASS |
| 03 | Etapa de nomes customizáveis | PASS |
| 04 | Etapa de cartões (adicionar/remover) | PASS |
| 05 | Código da família (UUID) exibido | PASS |
| 06 | Seleção de painel com nomes salvos | PASS |
| 07 | Dashboard Pessoa 1 carrega | PASS |
| 08 | Nomes customizados nos cards | PASS |
| 09 | Ajuste oculto no painel A | PASS |
| 10 | Cartão customizado no modal "+ Novo" | Verificar manualmente* |
| 11 | Ajuste visível no painel B | PASS |

\* O teste automatizado falhou no seletor do `<option>` (limitação do Playwright), mas o fluxo de cartões na etapa de setup passou.

Screenshots em `post-deploy/`.

## Como repetir o smoke automatizado

```bash
npm install --no-save playwright
npx playwright install chromium
node docs/smoke/run-smoke.mjs
```

## Smoke manual complementar (recomendado)

- [ ] **Sync**: abrir em 2 abas/navegadores com o mesmo código da família → lançamento aparece em tempo real
- [ ] **Isolamento**: família A não vê dados da família B
- [ ] **Lançamento**: criar despesa Cartão, Pix, Boleto
- [ ] **Ajuste**: só no painel Pessoa 2
- [ ] **Importação**: CSV/XLSX de fatura
- [ ] **Parcelas**: lançamento 1/10 gera parcelas futuras
- [ ] **Limpar mês**: apaga só do painel ativo
- [ ] **Configurações**: editar nomes/cartões sem perder householdId
