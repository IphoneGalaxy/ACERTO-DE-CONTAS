# Meu Acerto

Meu Acerto é uma aplicação web para gerenciamento de despesas compartilhadas entre duas pessoas — ideal para casais ou amigos que dividem contas.

## Funcionalidades

- **Configuração personalizada**: defina os nomes das duas pessoas e cadastre quantos cartões quiser
- **Sincronização em tempo real**: lançamentos aparecem instantaneamente para ambos via Firebase Firestore
- **Isolamento por família**: cada casal usa um código único (`householdId`) — seus dados não se misturam com outros usuários
- **Importação de faturas**: arquivos `.csv` ou `.xlsx` do banco
- **Controle de parcelas**: gera parcelas futuras automaticamente
- **Histórico mensal**: navegue entre meses anteriores
- **PWA**: adicione à tela inicial do celular

## Primeiro uso

1. Abra o app e escolha **Criar nova família**
2. Informe os nomes das duas pessoas
3. Cadastre os cartões (nome, 4 últimos dígitos, dono)
4. **Copie o código da família** e compartilhe com a outra pessoa
5. Escolha quem está usando o app agora

No segundo dispositivo: **Entrar com código da família** → colar o código → configurar nomes/cartões → escolher painel.

## Regras de negócio (fixas)

- **Pessoa 1** paga 100% das faturas de cartão nos cálculos de pagamento
- **Pessoa 2** tem acesso exclusivo ao tipo **Ajuste**
- Cartões marcados como **Ambos** entram metade/metade nos totais
- Divisão **Dividido** = 50/50

## Deploy (GitHub Pages)

Publicado em: https://iphonegalaxy.github.io/ACERTO-DE-CONTAS/

O deploy é automático via GitHub Actions ao enviar alterações para `main`.

### Configurar Firebase (obrigatório)

1. Crie um **novo** projeto no [Firebase Console](https://console.firebase.google.com/) (não use o app pessoal)
2. Ative **Authentication → Login anônimo**
3. Ative **Firestore** e publique as regras de [`firestore.rules`](firestore.rules)
4. Cadastre estes **GitHub Secrets** no repositório `ACERTO-DE-CONTAS`:

| Secret | Valor |
|--------|-------|
| `FIREBASE_API_KEY` | apiKey do projeto |
| `FIREBASE_AUTH_DOMAIN` | authDomain |
| `FIREBASE_PROJECT_ID` | projectId |
| `FIREBASE_STORAGE_BUCKET` | storageBucket |
| `FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `FIREBASE_APP_ID` | appId |

### Desenvolvimento local

```bash
cp firebase-config.example.js firebase-config.js
# Edite firebase-config.js com suas credenciais
npx serve .
```

Abra `http://localhost:3000` (ou a porta indicada pelo serve).

## Estrutura

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App completo (React + Firebase) |
| `firebase-config.example.js` | Template de configuração |
| `firestore.rules` | Regras de segurança Firestore |
| `sw.js` | Service worker (PWA) |
