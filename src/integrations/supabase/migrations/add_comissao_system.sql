-- Adicionar campos de comissão na tabela vendas
ALTER TABLE vendas 
ADD COLUMN comissao_percentual DECIMAL(5,2) DEFAULT 5.00,
ADD COLUMN comissao_valor DECIMAL(10,2) DEFAULT NULL;

-- Adicionar campos de comissão na tabela clientes
ALTER TABLE clientes 
ADD COLUMN comissao_personalizada DECIMAL(5,2) DEFAULT NULL;

-- Comentários explicativos
COMMENT ON COLUMN vendas.comissao_percentual IS 'Percentual de comissão aplicado na venda (padrão 5%)';
COMMENT ON COLUMN vendas.comissao_valor IS 'Valor calculado da comissão da venda';
COMMENT ON COLUMN clientes.comissao_personalizada IS 'Percentual de comissão personalizado para o cliente (sobrescreve o padrão)';

-- Função para calcular comissão automaticamente
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
    percentual_comissao DECIMAL(5,2);
    cliente_comissao DECIMAL(5,2);
BEGIN
    -- Buscar comissão personalizada do cliente
    SELECT comissao_personalizada INTO cliente_comissao
    FROM clientes 
    WHERE id = NEW.cliente_id;
    
    -- Usar comissão personalizada do cliente ou padrão da venda
    percentual_comissao := COALESCE(cliente_comissao, NEW.comissao_percentual, 5.00);
    
    -- Calcular valor da comissão
    NEW.comissao_valor := (NEW.total * percentual_comissao) / 100;
    NEW.comissao_percentual := percentual_comissao;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular comissão automaticamente
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();