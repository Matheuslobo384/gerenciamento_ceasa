-- =====================================================
-- MIGRAÇÃO COMPLETA DO BANCO DE DADOS
-- Sistema de Gestão de Mercadorias - LECULGO
-- =====================================================

-- 1. CRIAR TABELA DE CONFIGURAÇÕES
-- =====================================================
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
-- =====================================================
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS frete DECIMAL(10,2) DEFAULT NULL;

COMMENT ON COLUMN produtos.frete IS 'Valor do frete personalizado para o produto';

-- 3. ADICIONAR COLUNAS DE COMISSÃO NA TABELA VENDAS
-- =====================================================
ALTER TABLE vendas 
ADD COLUMN IF NOT EXISTS comissao_percentual DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS comissao_valor DECIMAL(10,2);

COMMENT ON COLUMN vendas.comissao_percentual IS 'Percentual de comissão aplicado na venda';
COMMENT ON COLUMN vendas.comissao_valor IS 'Valor calculado da comissão';

-- 4. ADICIONAR COLUNA DE COMISSÃO PERSONALIZADA NA TABELA CLIENTES
-- =====================================================
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS comissao_personalizada DECIMAL(5,2);

COMMENT ON COLUMN clientes.comissao_personalizada IS 'Percentual de comissão específico do cliente';

-- 5. CRIAR FUNÇÃO PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CRIAR TRIGGER PARA TABELA CONFIGURAÇÕES
-- =====================================================
DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes;
CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CRIAR FUNÇÃO PARA CALCULAR COMISSÃO AUTOMATICAMENTE
-- =====================================================
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
-- =====================================================
DROP TRIGGER IF EXISTS trigger_calcular_comissao ON vendas;
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();

-- 9. INSERIR CONFIGURAÇÕES PADRÃO
-- =====================================================
INSERT INTO configuracoes (chave, valor) VALUES 
('frete_fixo', '15.00'),
('comissao_personalizada', '5.00')
ON CONFLICT (chave) DO NOTHING;

-- 10. ATUALIZAR VENDAS EXISTENTES COM COMISSÃO PADRÃO
-- =====================================================
UPDATE vendas 
SET comissao_percentual = 5.0,
    comissao_valor = (total * 5.0 / 100)
WHERE comissao_percentual IS NULL;

-- 11. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_comissao ON vendas(comissao_percentual, comissao_valor);
CREATE INDEX IF NOT EXISTS idx_clientes_comissao ON clientes(comissao_personalizada);
CREATE INDEX IF NOT EXISTS idx_produtos_frete ON produtos(frete);

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a tabela configurações foi criada
SELECT 'Tabela configurações criada com sucesso!' as status 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'configuracoes');

-- Verificar configurações inseridas
SELECT 'Configurações padrão inseridas:' as status;
SELECT chave, valor FROM configuracoes ORDER BY chave;

-- Verificar colunas adicionadas
SELECT 'Colunas adicionadas com sucesso!' as status;
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('produtos', 'vendas', 'clientes') 
    AND column_name IN ('frete', 'comissao_percentual', 'comissao_valor', 'comissao_personalizada')
ORDER BY table_name, column_name;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================
/*
APÓS EXECUTAR ESTA MIGRAÇÃO:

1. FUNCIONALIDADES HABILITADAS:
   ✅ Sistema de configurações globais
   ✅ Frete personalizado por produto
   ✅ Comissão automática nas vendas
   ✅ Comissão personalizada por cliente
   ✅ Configuração de frete fixo global
   ✅ Configuração de comissão global

2. COMO USAR:
   - Configure frete fixo no modal de configurações
   - Configure comissão padrão no modal de configurações
   - Defina comissão personalizada por cliente
   - Defina frete personalizado por produto
   - As vendas calcularão comissão automaticamente

3. PRIORIDADE DE COMISSÃO:
   1. Comissão definida na venda (maior prioridade)
   2. Comissão personalizada do cliente
   3. Comissão global configurada
   4. Comissão padrão (5%)

4. VERIFICAÇÃO:
   Execute: SELECT * FROM configuracoes;
   Deve retornar 2 registros com frete_fixo e comissao_personalizada
*/

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================