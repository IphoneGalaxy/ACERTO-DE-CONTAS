# Smoke test — Meu Acerto

## Pré-requisitos

O app exige **login** (Google ou e-mail/senha). Para o smoke automatizado, configure:

```bash
export SMOKE_TEST_EMAIL="conta-de-teste@exemplo.com"
export SMOKE_TEST_PASSWORD="senha1234"
```

A conta deve existir no Firebase e **não** ter família vinculada (ou o teste para na tela de boas-vindas).

## Como repetir o smoke automatizado

```bash
npm install --no-save playwright
npx playwright install chromium
node docs/smoke/run-smoke.mjs
```

Opcional: `SMOKE_BASE_URL=http://localhost:3456/` para testar localmente.

## Smoke manual complementar (recomendado)

- [ ] **Login Google** e **login e-mail/senha** no GitHub Pages
- [ ] **Sync**: conta A cria família → conta B entra com código → lançamento aparece em tempo real
- [ ] **Isolamento**: família A não vê dados da família B
- [ ] **Exclusão**: criador exclui família → ambos voltam ao wizard
- [ ] **Membro**: quem entrou com código não vê opção de excluir família
- [ ] **Lançamento**: criar despesa Cartão, Pix, Boleto
- [ ] **Ajuste**: só no painel Pessoa 2
- [ ] **Importação**: CSV/XLSX de fatura
- [ ] **Parcelas**: lançamento 1/10 gera parcelas futuras
- [ ] **Configurações**: editar nomes/cartões sem perder householdId

Screenshots em `post-deploy/`.
