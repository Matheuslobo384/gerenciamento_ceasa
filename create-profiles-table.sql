-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE PERFIS DE USUÁRIO
-- =====================================================
-- Execute este SQL no Supabase SQL Editor
-- https://supabase.com/dashboard -> SQL Editor

-- 1. Criar tabela profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
    ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- 6. Criar políticas de segurança
-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para usuários inserirem apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para usuários deletarem apenas seu próprio perfil
CREATE POLICY "Users can delete own profile" ON profiles
    FOR DELETE USING (auth.uid() = id);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_nome ON profiles(nome);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute estas queries para verificar se tudo foi criado corretamente:

-- Verificar se a tabela foi criada
-- SELECT * FROM profiles LIMIT 5;

-- Verificar políticas RLS
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Verificar triggers
-- SELECT * FROM information_schema.triggers WHERE event_object_table = 'profiles';

COMMENT ON TABLE profiles IS 'Tabela de perfis de usuário com dados complementares ao auth.users';
COMMENT ON COLUMN profiles.id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN profiles.nome IS 'Nome completo do usuário';
COMMENT ON COLUMN profiles.email IS 'Email do usuário (sincronizado com auth.users)';
COMMENT ON COLUMN profiles.telefone IS 'Telefone do usuário (opcional)';
COMMENT ON COLUMN profiles.empresa IS 'Empresa do usuário (opcional)';

-- =====================================================
-- SUCESSO!
-- =====================================================
-- Após executar este SQL, a tabela profiles estará criada
-- e o sistema de perfis funcionará corretamente!