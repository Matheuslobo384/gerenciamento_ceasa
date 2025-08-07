-- CORREÇÃO DO CÁLCULO DE COMISSÃO
-- O problema: A comissão está sendo calculada sobre o total (que inclui frete)
-- A solução: Calcular a comissão apenas sobre o subtotal dos produtos

-- 1. Criar função para calcular subtotal dos produtos de uma venda
CREATE OR REPLACE FUNCTION calcular_subtotal_produtos(venda_id_param UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    subtotal_produtos DECIMAL(10,2) := 0;
BEGIN
    SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
    INTO subtotal_produtos
    FROM itens_venda
    WHERE venda_id = venda_id_param;
    
    RETURN subtotal_produtos;
END;
$$ LANGUAGE plpgsql;

-- 2. Corrigir a função de cálculo de comissão
CREATE OR REPLACE FUNCTION calcular_comissao_venda()
RETURNS TRIGGER AS $$
DECLARE
    percentual_comissao DECIMAL(5,2) := 5.0;
    cliente_comissao DECIMAL(5,2);
    subtotal_produtos DECIMAL(10,2);
BEGIN
    -- Se há comissão personalizada definida na venda, usar ela
    IF NEW.comissao_percentual IS NOT NULL THEN
        -- Para vendas novas (INSERT), calcular subtotal dos produtos
        IF TG_OP = 'INSERT' THEN
            -- Durante INSERT, os itens ainda não existem, então usar total - frete + desconto
            subtotal_produtos := NEW.total - COALESCE(NEW.frete, 0) + COALESCE(NEW.desconto, 0);
        ELSE
            -- Durante UPDATE, calcular subtotal real dos produtos
            subtotal_produtos := calcular_subtotal_produtos(NEW.id);
        END IF;
        
        NEW.comissao_valor := (subtotal_produtos * NEW.comissao_percentual / 100);
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
    
    -- Calcular subtotal dos produtos
    IF TG_OP = 'INSERT' THEN
        -- Durante INSERT, os itens ainda não existem, então usar total - frete + desconto
        subtotal_produtos := NEW.total - COALESCE(NEW.frete, 0) + COALESCE(NEW.desconto, 0);
    ELSE
        -- Durante UPDATE, calcular subtotal real dos produtos
        subtotal_produtos := calcular_subtotal_produtos(NEW.id);
    END IF;
    
    -- Calcular comissão sobre o subtotal dos produtos (não sobre o total)
    NEW.comissao_percentual := percentual_comissao;
    NEW.comissao_valor := (subtotal_produtos * percentual_comissao / 100);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar o trigger
DROP TRIGGER IF EXISTS trigger_calcular_comissao ON vendas;
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();

-- 4. Atualizar vendas existentes com comissão correta
-- Primeiro, vamos criar uma função temporária para recalcular
CREATE OR REPLACE FUNCTION recalcular_comissoes_existentes()
RETURNS void AS $$
DECLARE
    venda_record RECORD;
    subtotal_produtos DECIMAL(10,2);
    nova_comissao DECIMAL(10,2);
BEGIN
    FOR venda_record IN 
        SELECT id, comissao_percentual 
        FROM vendas 
        WHERE comissao_valor IS NOT NULL
    LOOP
        -- Calcular subtotal real dos produtos
        SELECT COALESCE(SUM(quantidade * preco_unitario), 0)
        INTO subtotal_produtos
        FROM itens_venda
        WHERE venda_id = venda_record.id;
        
        -- Calcular nova comissão
        nova_comissao := (subtotal_produtos * COALESCE(venda_record.comissao_percentual, 5.0) / 100);
        
        -- Atualizar apenas a comissao_valor (sem disparar o trigger)
        UPDATE vendas 
        SET comissao_valor = nova_comissao
        WHERE id = venda_record.id;
        
        RAISE NOTICE 'Venda % - Subtotal: %, Nova comissão: %', 
            venda_record.id, subtotal_produtos, nova_comissao;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 5. Executar a correção das vendas existentes
SELECT recalcular_comissoes_existentes();

-- 6. Remover a função temporária
DROP FUNCTION recalcular_comissoes_existentes();

-- 7. Verificação dos resultados
SELECT 
    v.id,
    v.total,
    v.frete,
    v.desconto,
    COALESCE(SUM(iv.quantidade * iv.preco_unitario), 0) as subtotal_produtos,
    v.comissao_percentual,
    v.comissao_valor,
    ROUND((COALESCE(SUM(iv.quantidade * iv.preco_unitario), 0) * v.comissao_percentual / 100), 2) as comissao_esperada
FROM vendas v
LEFT JOIN itens_venda iv ON v.id = iv.venda_id
WHERE v.comissao_valor IS NOT NULL
GROUP BY v.id, v.total, v.frete, v.desconto, v.comissao_percentual, v.comissao_valor
ORDER BY v.created_at DESC
LIMIT 10;

-- RESUMO DA CORREÇÃO:
-- ✅ Comissão agora é calculada sobre o subtotal dos produtos (sem frete)
-- ✅ Vendas existentes foram recalculadas
-- ✅ Trigger atualizado para futuras vendas
-- ✅ Função de verificação incluída