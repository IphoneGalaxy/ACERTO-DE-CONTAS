# Smoke test — Meu Acerto genérico

Screenshots capturados durante validação da implementação.

| Arquivo | Descrição |
|---------|-----------|
| `01-welcome-generico.png` | Tela exibida sem Firebase configurado (dev local) |
| `02-legacy-*.png` | Referência do app anterior (nomes fixos Guilherme/Thais) |

## Como repetir o smoke

1. Configure `firebase-config.js` com credenciais de um projeto Firebase **novo** (não o pessoal)
2. Publique `firestore.rules` no console Firebase
3. Sirva localmente: `npx serve . -p 3456`
4. Fluxo a validar:
   - Criar família → nomes → cartões → copiar código
   - Segundo navegador: entrar com código → sync em tempo real
   - Painel Pessoa 1 vs Pessoa 2 (Ajuste só no 2)
   - Lançamento manual e importação CSV
