-- =====================================================
-- CONFIGURAÇÃO RÁPIDA DO BANCO DE DADOS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. CRIAR TABELA DE CONFIGURAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERIR CONFIGURAÇÕES PADRÃO DE FRETE
INSERT INTO configuracoes (chave, valor) VALUES 
('frete_fixo', '"15.00"'),
('tipo_calculo_frete', '"por_pedido"'),
('frete_por_quantidade', '"5.00"'),
('comissao_personalizada', '"5.00"')
ON CONFLICT (chave) DO UPDATE SET 
  valor = EXCLUDED.valor,
  updated_at = NOW();

-- 3. VERIFICAR SE AS CONFIGURAÇÕES FORAM INSERIDAS
SELECT 'Configurações inseridas com sucesso!' as status;
SELECT chave, valor FROM configuracoes ORDER BY chave;

-- =====================================================
-- PRONTO! Agora o sistema de configurações funcionará
-- =====================================================