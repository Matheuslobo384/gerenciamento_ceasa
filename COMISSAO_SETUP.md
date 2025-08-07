# Sistema de Comissão - Instruções de Configuração

## Migração do Banco de Dados

Para implementar o sistema de comissão, você precisa executar a migração SQL no seu banco de dados Supabase.

### Passos para executar a migração:

1. **Acesse o painel do Supabase**
   - Vá para [https://supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute a migração**
   - Copie todo o conteúdo do arquivo `add_comissao_system.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

### O que a migração faz:

1. **Adiciona colunas na tabela `vendas`:**
   - `comissao_percentual`: Percentual de comissão aplicado
   - `comissao_valor`: Valor calculado da comissão

2. **Adiciona coluna na tabela `clientes`:**
   - `comissao_personalizada`: Percentual de comissão específico do cliente

3. **Cria função e trigger automático:**
   - Calcula automaticamente a comissão ao criar/atualizar vendas
   - Usa comissão personalizada da venda > comissão do cliente > padrão (5%)

4. **Atualiza vendas existentes:**
   - Aplica comissão padrão de 5% em vendas já existentes

### Funcionalidades implementadas:

- **Comissão padrão:** 5% para todas as vendas
- **Comissão por cliente:** Cada cliente pode ter um percentual personalizado
- **Comissão por venda:** Cada venda pode ter um percentual específico
- **Cálculo automático:** O sistema calcula automaticamente o valor da comissão
- **Relatórios atualizados:** Substituição do "ticket médio" por "comissão total"
- **Remoção do frete expresso:** Simplificação do sistema de frete

### Verificação:

Após executar a migração, você pode verificar se tudo funcionou executando:

```sql
-- Verificar estrutura das tabelas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('vendas', 'clientes') 
AND column_name LIKE '%comissao%';

-- Verificar se as vendas têm comissão calculada
SELECT id, total, comissao_percentual, comissao_valor 
FROM vendas 
LIMIT 5;
```

### Observações importantes:

- ⚠️ **Backup:** Sempre faça backup do banco antes de executar migrações
- 🔄 **Reversão:** Se precisar reverter, remova as colunas adicionadas
- 📊 **Relatórios:** Os relatórios agora mostram comissão em vez de ticket médio
- 🚚 **Frete:** A opção de frete expresso foi removida

### Suporte:

Se encontrar algum erro durante a migração, verifique:
1. Se você tem permissões de administrador no banco
2. Se as tabelas `vendas` e `clientes` existem
3. Se não há conflitos com colunas existentes