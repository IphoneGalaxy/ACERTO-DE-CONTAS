# test/fixtures

## Regras para fixtures de teste

### ✅ O que PODE ser versionado aqui
- Arquivos **sintéticos** gerados manualmente (sem dados reais de pessoas ou contas).
- Arquivos **anonimizados** com todos os dados pessoais substituídos (nomes → "Fulano", CPF → "000.000.000-00", valores → números fictícios).
- Apenas a estrutura necessária para validar os parsers (colunas, formato, seções).

### ❌ O que NÃO pode ser versionado aqui
- **Extratos reais** com dados pessoais (nome, CPF, endereço, número de conta/cartão, valores reais).
- **PDFs de fatura reais** de qualquer banco.
- **Arquivos OFX/CSV** com FITIDs, ACCTIDs ou qualquer identificador que possa ser rastreado a uma conta real.
- **Qualquer arquivo** que contenha `AIzaSy`, tokens, chaves de API, ou credenciais.

### Onde colocar arquivos reais para teste local
Coloque em `docs/modelos_extratos_bancarios/` (pasta gitignored).
Essa pasta é estritamente local e **nunca** deve ser commitada.

### Como criar uma fixture sintética
1. Pegue um arquivo real como referência de formato.
2. Substitua **todos** os dados pessoais e valores por placeholders.
3. Mantenha a estrutura de colunas/seções intacta.
4. Salve com extensão `.sintetico.csv` ou `.sintetico.pdf` para indicar que é sintético.

### Exemplo de fixture sintética Nubank CSV
```csv
date,title,amount
2026-01-01,Compra Exemplo - Parcela 1/3,"100,00"
2026-01-05,Outra Compra,"50,00"
2026-01-10,Pagamento recebido,"- 150,00"
```
