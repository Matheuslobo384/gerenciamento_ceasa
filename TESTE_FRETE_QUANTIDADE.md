# 🧪 Teste de Frete por Quantidade - Guia Completo

## 📋 Visão Geral

Criamos uma página especial de teste para verificar e validar o cálculo de frete por quantidade de produtos. Esta ferramenta permite testar todos os tipos de cálculo de frete em tempo real.

## 🚀 Como Acessar

1. **Via Menu**: Clique em "🧪 Teste Frete" no menu lateral
2. **Via URL**: Acesse diretamente `/teste-frete`

## 🔧 Funcionalidades da Página de Teste

### 📊 Configurações Atuais
- Mostra as configurações de frete carregadas do banco de dados
- Exibe: Frete Padrão, Tipo de Cálculo e Frete por Quantidade

### 🛒 Itens de Teste
- **Adicionar/Remover**: Botões para gerenciar itens de teste
- **Seleção de Produto**: Dropdown com produtos cadastrados
- **Quantidade**: Campo para definir quantidade de cada produto
- **Preço**: Campo para definir preço unitário

### 📈 Cálculos em Tempo Real

#### 1. **Por Quantidade** (Foco Principal)
- **Fórmula**: `Quantidade Total × Valor por Quantidade`
- **Exemplo**: 6 produtos × R$ 5,00 = R$ 30,00
- **Validação**: Compara cálculo automático vs manual

#### 2. **Por Produto**
- **Fórmula**: `Soma(Frete Individual × Quantidade de cada produto)`
- **Exemplo**: (2×R$10) + (3×R$15) + (1×R$20) = R$85

#### 3. **Por Pedido**
- **Fórmula**: `Valor Fixo`
- **Exemplo**: R$ 15,00 (independente da quantidade)

### 🔍 Debug Info
- Seção expansível com dados técnicos
- JSON completo das configurações e cálculos
- Útil para desenvolvedores identificarem problemas

## ✅ Como Testar o Frete por Quantidade

### Passo 1: Configurar o Sistema
1. Vá em **Configurações** → **Frete**
2. Selecione **"Por Quantidade"**
3. Defina o valor por produto (ex: R$ 5,00)
4. Salve as configurações

### Passo 2: Usar a Página de Teste
1. Acesse **🧪 Teste Frete**
2. Adicione produtos com diferentes quantidades
3. Observe o cálculo em tempo real
4. Verifique se o resultado está correto

### Passo 3: Validar em Vendas Reais
1. Vá em **Vendas** → **Nova Venda**
2. Adicione os mesmos produtos e quantidades
3. Compare o valor do frete calculado

## 🐛 Solução de Problemas

### Problema: "Frete não está calculando corretamente"
**Possíveis Causas:**
1. **Tabela configurações não existe**
   - Execute o arquivo `setup-database.sql` no Supabase

2. **Configurações não foram salvas**
   - Vá em Configurações → Frete e salve novamente

3. **Produtos sem dados de frete**
   - Verifique se os produtos têm o campo `frete` preenchido

4. **Cache do navegador**
   - Recarregue a página (Ctrl+F5)

### Problema: "Página de teste não carrega"
**Soluções:**
1. Verifique se o servidor está rodando (`npm run dev`)
2. Limpe o cache do navegador
3. Verifique o console do navegador para erros

## 📝 Exemplo Prático

### Cenário de Teste
```
Produto A: 2 unidades × R$ 50,00 (frete: R$ 10,00)
Produto B: 3 unidades × R$ 30,00 (frete: padrão R$ 15,00)
Produto C: 1 unidade × R$ 100,00 (frete: R$ 20,00)

Total de produtos: 2 + 3 + 1 = 6 unidades
```

### Resultados Esperados
- **Por Quantidade**: 6 × R$ 5,00 = **R$ 30,00**
- **Por Produto**: (2×R$10) + (3×R$15) + (1×R$20) = **R$ 85,00**
- **Por Pedido**: **R$ 15,00** (fixo)

## 🎯 Validação de Sucesso

✅ **Indicadores de que está funcionando:**
- Cálculo "Por Quantidade" mostra ✅ CORRETO
- Valor calculado = Quantidade Total × Valor por Quantidade
- Detalhes mostram a fórmula correta
- Mesmo resultado na página de vendas

❌ **Indicadores de problema:**
- Cálculo mostra ❌ ERRO
- Valores inconsistentes entre teste e vendas
- Configurações não carregam
- Erros no console do navegador

## 🔧 Arquivos Relacionados

- **Componente de Teste**: `src/components/TesteFreteQuantidade.tsx`
- **Lógica de Cálculo**: `src/lib/frete.ts`
- **Hook de Configuração**: `src/hooks/useFreteConfig.ts`
- **Configuração de Banco**: `setup-database.sql`

## 📞 Suporte

Se ainda houver problemas:
1. Verifique o arquivo `CONFIGURAR_BANCO.md`
2. Execute o script `verificar-configuracoes.js`
3. Consulte os logs do navegador (F12 → Console)

---

**✨ Esta ferramenta garante que o cálculo de frete por quantidade funcione perfeitamente antes de usar em vendas reais!**