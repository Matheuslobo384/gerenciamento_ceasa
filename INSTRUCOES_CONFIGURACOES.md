# 🔧 INSTRUÇÕES PARA CONFIGURAR O BANCO DE DADOS

## ❌ Problema Identificado

A tabela `configuracoes` **NÃO EXISTE** no banco de dados Supabase. Por isso você está recebendo os erros:
- "Erro ao atualizar frete fixo"
- "Erro ao atualizar comissão personalizada"

## ✅ SOLUÇÃO COMPLETA - Execute no Painel do Supabase

### Passo 1: Acesse o Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: **gxiehrlepqrqquyrzjpy**

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Execute o SQL Completo
Copie e cole o código abaixo no editor SQL e clique em **"Run"**:

```sql
-- =====================================================
-- MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- Sistema de Gestão de Mercadorias - LECULGO
-- =====================================================

-- 1. CRIAR TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela configurações
COMMENT ON TABLE configuracoes IS 'Tabela para armazenar configurações do sistema';
COMMENT ON COLUMN configuracoes.chave IS 'Chave única da configuração';
COMMENT ON COLUMN configuracoes.valor IS 'Valor da configuração em formato JSON';

-- 2. ADICIONAR COLUNA FRETE NA TABELA PRODUTOS
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS frete DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN produtos.frete IS 'Valor do frete personalizado para o produto';

-- 3. ADICIONAR COLUNAS DE COMISSÃO NA TABELA VENDAS
ALTER TABLE vendas 
ADD COLUMN IF NOT EXISTS comissao_percentual DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS comissao_valor DECIMAL(10,2);

COMMENT ON COLUMN vendas.comissao_percentual IS 'Percentual de comissão aplicado na venda';
COMMENT ON COLUMN vendas.comissao_valor IS 'Valor calculado da comissão';

-- 4. ADICIONAR COLUNA DE COMISSÃO PERSONALIZADA NA TABELA CLIENTES
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS comissao_personalizada DECIMAL(5,2);

COMMENT ON COLUMN clientes.comissao_personalizada IS 'Percentual de comissão específico do cliente';

-- 5. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CRIAR TRIGGER PARA TABELA CONFIGURAÇÕES
DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CRIAR FUNÇÃO PARA CALCULAR COMISSÃO AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
    percentual_comissao DECIMAL(5,2) := 5.0; -- Percentual padrão de 5%
    cliente_comissao DECIMAL(5,2);
    config_comissao DECIMAL(5,2);
BEGIN
    -- Se há comissão personalizada definida na venda, usar ela
    IF NEW.comissao_percentual IS NOT NULL THEN
        NEW.comissao_valor := (NEW.total * NEW.comissao_percentual / 100);
        RETURN NEW;
    END IF;
    
    -- Verificar se há configuração global de comissão
    SELECT (valor::text)::DECIMAL(5,2) INTO config_comissao 
    FROM configuracoes 
    WHERE chave = 'comissao_personalizada';
    
    IF config_comissao IS NOT NULL THEN
        percentual_comissao := config_comissao;
    END IF;
    
    -- Se há cliente associado, verificar se tem comissão personalizada
    IF NEW.cliente_id IS NOT NULL THEN
        SELECT comissao_personalizada INTO cliente_comissao 
        FROM clientes 
        WHERE id = NEW.cliente_id;
        
        IF cliente_comissao IS NOT NULL THEN
            percentual_comissao := cliente_comissao;
        END IF;
    END IF;
    
    -- Calcular comissão
    NEW.comissao_percentual := percentual_comissao;
    NEW.comissao_valor := (NEW.total * percentual_comissao / 100);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. CRIAR TRIGGER PARA CALCULAR COMISSÃO AUTOMATICAMENTE
DROP TRIGGER IF EXISTS trigger_calcular_comissao ON vendas;
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();

-- 9. INSERIR CONFIGURAÇÕES PADRÃO
INSERT INTO configuracoes (chave, valor) VALUES 
('frete_fixo', '15.00'),
('comissao_personalizada', '5.00')
ON CONFLICT (chave) DO NOTHING;

-- 10. ATUALIZAR VENDAS EXISTENTES COM COMISSÃO PADRÃO
UPDATE vendas 
SET comissao_percentual = 5.0,
    comissao_valor = (total * 5.0 / 100)
WHERE comissao_percentual IS NULL;

-- 11. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_comissao ON vendas(comissao_percentual, comissao_valor);
CREATE INDEX IF NOT EXISTS idx_clientes_comissao ON clientes(comissao_personalizada);
CREATE INDEX IF NOT EXISTS idx_produtos_frete ON produtos(frete);
```

### Passo 4: Verificar se funcionou
Após executar o SQL, execute esta query para verificar:

```sql
SELECT * FROM configuracoes;
```

Você deve ver 2 registros:
- `frete_fixo` com valor `15.00`
- `comissao_personalizada` com valor `5.00`

## 🎯 Funcionalidades Habilitadas

Após executar a migração completa:

### ✅ Sistema de Configurações
- ✅ Configuração de frete fixo global
- ✅ Configuração de comissão padrão global
- ✅ Modal de configurações funcionando

### ✅ Sistema de Frete
- ✅ Frete personalizado por produto
- ✅ Frete fixo configurável
- ✅ Cálculo automático de frete

### ✅ Sistema de Comissão
- ✅ Comissão automática nas vendas
- ✅ Comissão personalizada por cliente
- ✅ Comissão configurável globalmente
- ✅ Prioridade: Venda > Cliente > Global > Padrão (5%)

### ✅ Performance
- ✅ Índices otimizados
- ✅ Triggers automáticos
- ✅ Funções de cálculo

## 🔧 Como Usar o Sistema

### Configurações Globais
1. Clique no perfil do usuário (canto superior direito)
2. Selecione "Configurações"
3. Configure:
   - **Senha do Administrador**: Altere a senha de acesso
   - **Frete Fixo**: Defina o valor padrão de frete
   - **Comissão Personalizada**: Defina o percentual padrão de comissão

### Frete por Produto
1. Vá para "Produtos"
2. Ao criar/editar um produto, defina o campo "Frete"
3. Se não definido, usará o frete fixo global

### Comissão por Cliente
1. Vá para "Clientes"
2. Ao criar/editar um cliente, defina "Comissão Personalizada"
3. Se não definido, usará a comissão global

### Vendas com Comissão Automática
1. Ao criar uma venda, a comissão será calculada automaticamente
2. Prioridade de cálculo:
   - Comissão definida na venda (se especificada)
   - Comissão do cliente (se definida)
   - Comissão global (configurada no sistema)
   - Comissão padrão (5%)

## 📞 Suporte

Se encontrar algum erro:
1. Verifique se você tem permissões de administrador no projeto Supabase
2. Certifique-se de estar no projeto correto: `gxiehrlepqrqquyrzjpy`
3. Execute o SQL exatamente como mostrado acima
4. Se persistir o erro, execute apenas o SQL mínimo:

```sql
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO configuracoes (chave, valor) VALUES 
('frete_fixo', '15.00'),
('comissao_personalizada', '5.00')
ON CONFLICT (chave) DO NOTHING;
```

---

**⚠️ IMPORTANTE**: Sem executar este SQL, as funcionalidades de configuração, frete e comissão não funcionarão!

**🎉 APÓS A MIGRAÇÃO**: O sistema estará completamente funcional com todas as features integradas!