-- Adicionar campo de frete na tabela produtos
ALTER TABLE produtos 
ADD COLUMN frete DECIMAL(10,2) DEFAULT NULL;

-- Comentário explicativo
COMMENT ON COLUMN produtos.frete IS 'Valor do frete personalizado para o produto'; 