-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS configuracoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT UNIQUE NOT NULL,
  valor JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON TABLE configuracoes IS 'Tabela para armazenar configurações do sistema';
COMMENT ON COLUMN configuracoes.chave IS 'Chave única da configuração';
COMMENT ON COLUMN configuracoes.valor IS 'Valor da configuração em formato JSON';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracoes_updated_at 
    BEFORE UPDATE ON configuracoes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 