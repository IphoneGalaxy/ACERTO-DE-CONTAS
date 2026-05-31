# Meu Acerto

Meu Acerto é uma aplicação web para gerenciamento de despesas compartilhadas entre duas pessoas — ideal para casais ou amigos que dividem contas.

## Funcionalidades

- **Conta individual**: login com Google ou e-mail/senha (mín. 8 caracteres)
- **Configuração personalizada**: defina os nomes das duas pessoas e cadastre quantos cartões quiser
- **Sincronização em tempo real**: lançamentos aparecem instantaneamente para ambos via Firebase Firestore
- **Isolamento por família**: cada casal usa um código único (`householdId`) — dados protegidos por membership
- **Importação de faturas por banco**: selecione o banco, importe `.csv` ou `.xlsx`; cartões detectados automaticamente na fatura
- **Filtro por banco**: na aba Cartão, veja todos os cartões ou só os de um banco (ex.: C6 Bank)
- **Controle de parcelas**: gera parcelas futuras automaticamente
- **Histórico mensal**: navegue entre meses anteriores
- **PWA**: adicione à tela inicial do celular

## Primeiro uso

1. **Crie uma conta** (Google ou e-mail/senha)
2. Escolha **Criar nova família**
3. Informe os nomes das duas pessoas
4. **Cartões (opcional)** — pode pular e cadastrar depois pela importação da fatura
5. **Copie o código da família** e compartilhe com a outra pessoa
6. Escolha quem está usando o app agora

### Importação por banco

1. No painel, clique em **Importar**
2. Selecione o banco da fatura (ex.: **C6 Bank**)
3. Escolha o arquivo Excel/CSV da fatura
4. Confirme — os **cartões são detectados** pelo arquivo e salvos na família
5. Para filtrar lançamentos: aba **Cartão** → **Todos os bancos** ou um banco específico

| Banco | Importação |
|-------|------------|
| C6 Bank | Disponível |
| Itaú, BB, Bradesco, Santander, Caixa, Nubank, Inter, Mercado Pago, PicPay | Em breve |

No segundo dispositivo: cole o **código da família**, depois **crie conta ou entre** com Google/e-mail — a conta fica vinculada e funciona em qualquer aparelho.

- **Quem cria a família**: conta Google ou e-mail/senha
- **Quem entra com código**: cola o código + cria conta ou entra — o código vincula à família

Cada conta pode pertencer a **uma família por vez**. O criador pode **excluir a família** (apaga todos os dados) e criar outra.

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
2. **Authentication → Provedores**
   - Ative **E-mail/Senha**
   - Ative **Google** (informe e-mail de suporte)
   - **Desative Login anônimo** (não é mais usado)
3. **Authentication → Settings → Authorized domains**
   - Confirme `localhost`
   - Adicione `iphonegalaxy.github.io`
4. Ative **Firestore** e publique as regras de [`firestore.rules`](firestore.rules)
5. Cadastre estes **GitHub Secrets** no repositório `ACERTO-DE-CONTAS`:

| Secret | Valor |
|--------|-------|
| `FIREBASE_API_KEY` | apiKey do projeto |
| `FIREBASE_AUTH_DOMAIN` | authDomain |
| `FIREBASE_PROJECT_ID` | projectId |
| `FIREBASE_STORAGE_BUCKET` | storageBucket |
| `FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `FIREBASE_APP_ID` | appId |

Opcional para smoke test automatizado:

| Secret | Valor |
|--------|-------|
| `SMOKE_TEST_EMAIL` | E-mail da conta de teste |
| `SMOKE_TEST_PASSWORD` | Senha da conta de teste (mín. 8 caracteres) |

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
