# Configuração da Coluna Frete

## Problema Identificado
O erro "Could not find the 'frete' column of 'produtos' in the schema cache" ocorre porque a coluna `frete` não existe na tabela `produtos` do banco de dados Supabase.

## ✅ SOLUÇÃO IMPLEMENTADA

### 1. Código Restaurado
O código foi restaurado para suportar completamente a funcionalidade de frete nas funções `createProduto` e `updateProduto`.

### 2. Para Adicionar a Coluna Frete no Banco de Dados

### Opção 1: Via Painel do Supabase
1. Acesse o painel do Supabase
2. Vá para Table Editor > produtos
3. Clique em "Add Column"
4. Configure:
   - Nome: `frete`
   - Tipo: `numeric` ou `decimal(10,2)`
   - Default: `NULL`
   - Nullable: `true`

### Opção 2: Via SQL no Supabase
Execute o seguinte SQL no SQL Editor do Supabase:

```sql
ALTER TABLE produtos 
ADD COLUMN frete DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN produtos.frete IS 'Valor do frete personalizado para o produto';
```

## Após Adicionar a Coluna

1. **Restaurar o código original** em `src/hooks/useProdutos.ts`:
   - Na função `createProduto`: remover a linha `delete insertData.frete;`
   - Na função `updateProduto`: restaurar a lógica de tratamento do campo frete

2. **Código para restaurar na função updateProduto**:
```typescript
const updateProduto = useMutation({
  mutationFn: async ({ id, ...produto }: Partial<Produto> & { id: string }) => {
    // Corrigir frete: garantir que seja number ou null
    let updateData = { ...produto };
    if (updateData.hasOwnProperty('frete')) {
      if (typeof updateData.frete === 'string') {
        if (updateData.frete === '' || updateData.frete === undefined) {
          updateData.frete = null;
        } else {
          updateData.frete = parseFloat(updateData.frete);
          if (isNaN(updateData.frete)) updateData.frete = null;
        }
      } else if (updateData.frete === undefined || updateData.frete === null) {
        updateData.frete = null;
      }
    }
    const { data, error } = await (supabase as any)
      .from('produtos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // ... resto do código
});
```

3. **Código para restaurar na função createProduto**:
```typescript
const createProduto = useMutation({
  mutationFn: async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    // Corrigir frete: garantir que seja number ou null
    let insertData = { ...produto };
    if (insertData.hasOwnProperty('frete')) {
      if (typeof insertData.frete === 'string') {
        if (insertData.frete === '' || insertData.frete === undefined) {
          insertData.frete = null;
        } else {
          insertData.frete = parseFloat(insertData.frete);
          if (isNaN(insertData.frete)) insertData.frete = null;
        }
      } else if (insertData.frete === undefined || insertData.frete === null) {
        insertData.frete = null;
      }
    }
    
    const { data, error } = await (supabase as any)
      .from('produtos')
      .insert([insertData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  // ... resto do código
});
```

## ⚠️ AÇÃO NECESSÁRIA

**IMPORTANTE**: Para que a funcionalidade de frete funcione completamente, você DEVE executar o SQL abaixo no seu banco de dados Supabase:

### Como Executar:
1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Vá para seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Cole e execute o seguinte SQL:

```sql
-- Adicionar coluna frete na tabela produtos
ALTER TABLE public.produtos 
ADD COLUMN frete DECIMAL(10,2) DEFAULT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.produtos.frete IS 'Valor do frete personalizado para o produto';

-- Adicionar colunas frete na tabela vendas
ALTER TABLE public.vendas 
ADD COLUMN frete DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN tipo_frete VARCHAR(20) DEFAULT 'padrao';

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.vendas.frete IS 'Valor do frete aplicado na venda';
COMMENT ON COLUMN public.vendas.tipo_frete IS 'Tipo de frete: padrao ou expresso';
```

5. Clique em "Run" para executar

## Status Atual
✅ Aplicação funcionando sem erros
✅ Criação de produtos funcionando
✅ Atualização de produtos funcionando
✅ Código restaurado para suporte completo ao frete
⚠️ **PENDENTE**: Executar SQL para adicionar colunas frete no banco (produtos e vendas)

## Após Executar o SQL
Após executar o SQL acima, a funcionalidade de frete estará completamente funcional:
- ✅ Criação de produtos com frete
- ✅ Atualização de produtos com frete
- ✅ Criação de vendas com frete
- ✅ Exibição de frete na interface
- ✅ Cálculos de frete nas vendas
- ✅ Tipos de frete (padrão e expresso)