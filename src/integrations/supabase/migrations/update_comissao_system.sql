-- Migração para atualizar sistema de comissão com configurações personalizadas
-- Execute este SQL no seu banco de dados Supabase

-- 1. Adicionar configuração de comissão padrão se não existir
INSERT INTO configuracoes (chave, valor) VALUES 
('comissao_padrao', '5.00')
ON CONFLICT (chave) DO NOTHING;

-- 2. Atualizar função de cálculo de comissão para usar configurações do sistema
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
    percentual_comissao DECIMAL(5,2) := 5.0; -- Percentual padrão de 5%
    cliente_comissao DECIMAL(5,2);
    config_comissao_personalizada DECIMAL(5,2);
    config_comissao_padrao DECIMAL(5,2);
BEGIN
    -- Se há comissão personalizada definida na venda, usar ela
    IF NEW.comissao_percentual IS NOT NULL THEN
        NEW.comissao_valor := (NEW.total * NEW.comissao_percentual / 100);
        RETURN NEW;
    END IF;
    
    -- Verificar configurações do sistema
    SELECT (valor::text)::DECIMAL(5,2) INTO config_comissao_personalizada 
    FROM configuracoes 
    WHERE chave = 'comissao_personalizada';
    
    SELECT (valor::text)::DECIMAL(5,2) INTO config_comissao_padrao 
    FROM configuracoes 
    WHERE chave = 'comissao_padrao';
    
    -- Usar comissão personalizada do sistema se configurada
    IF config_comissao_personalizada IS NOT NULL THEN
        percentual_comissao := config_comissao_personalizada;
    ELSEIF config_comissao_padrao IS NOT NULL THEN
        percentual_comissao := config_comissao_padrao;
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

-- 3. Recriar trigger para calcular comissão automaticamente
DROP TRIGGER IF EXISTS trigger_calcular_comissao ON vendas;
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();

-- 4. Atualizar vendas existentes que não têm comissão calculada
UPDATE vendas 
SET comissao_percentual = COALESCE(
    (SELECT (valor::text)::DECIMAL(5,2) FROM configuracoes WHERE chave = 'comissao_personalizada'),
    (SELECT (valor::text)::DECIMAL(5,2) FROM configuracoes WHERE chave = 'comissao_padrao'),
    5.0
),
comissao_valor = (total * COALESCE(
    (SELECT (valor::text)::DECIMAL(5,2) FROM configuracoes WHERE chave = 'comissao_personalizada'),
    (SELECT (valor::text)::DECIMAL(5,2) FROM configuracoes WHERE chave = 'comissao_padrao'),
    5.0
) / 100)
WHERE comissao_percentual IS NULL OR comissao_valor IS NULL;

-- 5. Criar índices para melhorar performance das consultas de comissão
CREATE INDEX IF NOT EXISTS idx_configuracoes_comissao ON configuracoes(chave) WHERE chave LIKE 'comissao%';
CREATE INDEX IF NOT EXISTS idx_vendas_comissao_percentual ON vendas(comissao_percentual);
CREATE INDEX IF NOT EXISTS idx_vendas_comissao_valor ON vendas(comissao_valor);

-- Comentários explicativos
COMMENT ON FUNCTION calcular_comissao_venda() IS 'Função que calcula automaticamente a comissão nas vendas com prioridade: Venda > Cliente > Sistema Personalizada > Sistema Padrão';
COMMENT ON COLUMN configuracoes.valor IS 'Valor da configuração (para comissões, armazena percentual como número)';

-- Verificar se tudo foi criado corretamente
SELECT 'Configurações de comissão:' as info;
SELECT chave, valor FROM configuracoes WHERE chave LIKE 'comissao%';

SELECT 'Trigger de comissão:' as info;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_calcular_comissao';
