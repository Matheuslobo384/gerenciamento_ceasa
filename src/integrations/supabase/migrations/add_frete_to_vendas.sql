-- Adicionar campos de frete na tabela vendas
ALTER TABLE vendas 
ADD COLUMN frete DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN tipo_frete VARCHAR(20) DEFAULT NULL;

-- Comentários explicativos
COMMENT ON COLUMN vendas.frete IS 'Valor do frete da venda';
COMMENT ON COLUMN vendas.tipo_frete IS 'Tipo do frete (padrao, expresso)'; 