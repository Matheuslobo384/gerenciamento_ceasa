# 🔧 CONFIGURAÇÃO DO BANCO DE DADOS

## ❌ Problema
As configurações de frete não estão sendo exibidas porque a tabela `configuracoes` não existe no banco de dados.

## ✅ SOLUÇÃO RÁPIDA

### Passo 1: Acesse o Supabase
1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login na sua conta
3. Selecione o projeto: **gxiehrlepqrqquyrzjpy**

### Passo 2: Abra o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Execute o SQL
1. Abra o arquivo `setup-database.sql` (na raiz do projeto)
2. Copie todo o conteúdo
3. Cole no editor SQL do Supabase
4. Clique em **"Run"**

### Passo 4: Verificar
Após executar o SQL, você deve ver:
- "Configurações inseridas com sucesso!"
- Lista das configurações criadas

## 🎉 RESULTADO
Após executar o SQL, as configurações de frete aparecerão na página de configurações:
- ✅ Tipo de Cálculo de Frete
- ✅ Frete Padrão
- ✅ Frete por Quantidade
- ✅ Comissão Personalizada

## 📱 Como Acessar
1. Abra o aplicativo
2. Clique em "Configurações" no menu lateral
3. Configure os valores de frete conforme necessário

---

**⚠️ IMPORTANTE**: Sem executar este SQL, as funcionalidades de configuração não funcionarão!