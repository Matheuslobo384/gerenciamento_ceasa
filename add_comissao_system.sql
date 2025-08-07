-- Migração para adicionar sistema de comissão
-- Execute este SQL no seu banco de dados Supabase

-- 1. Adicionar colunas de comissão na tabela vendas
ALTER TABLE vendas 
ADD COLUMN IF NOT EXISTS comissao_percentual DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS comissao_valor DECIMAL(10,2);

-- 2. Adicionar coluna de comissão personalizada na tabela clientes
ALTER TABLE clientes 
ADD COLUMN IF NOT EXISTS comissao_personalizada DECIMAL(5,2);

-- 3. Criar função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
    percentual_comissao DECIMAL(5,2) := 10.0; -- Percentual padrão de 10%
    cliente_comissao DECIMAL(5,2);
BEGIN
    -- Se há comissão personalizada definida na venda, usar ela
    IF NEW.comissao_percentual IS NOT NULL THEN
        NEW.comissao_valor := (NEW.total * NEW.comissao_percentual / 100);
        RETURN NEW;
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

-- 4. Criar trigger para calcular comissão automaticamente
DROP TRIGGER IF EXISTS trigger_calcular_comissao ON vendas;
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();

-- 5. Atualizar vendas existentes com comissão padrão de 10%
UPDATE vendas 
SET comissao_percentual = 10.0,
    comissao_valor = (total * 10.0 / 100)
WHERE comissao_percentual IS NULL;

-- Comentários:
-- - A comissão padrão é de 10%
-- - Clientes podem ter comissão personalizada
-- - Vendas podem ter comissão específica que sobrescreve a do cliente
-- - O trigger calcula automaticamente a comissão ao inserir/atualizar vendas