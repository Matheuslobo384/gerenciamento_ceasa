# 🏪 LECULGO - Sistema de Gestão de Mercadorias

Sistema completo de gestão de mercadorias desenvolvido com React, TypeScript, Supabase e Tailwind CSS.

## 🚀 Funcionalidades

### 📦 Gestão de Produtos
- ✅ Cadastro, edição e exclusão de produtos
- ✅ Controle de estoque
- ✅ Categorização de produtos
- ✅ Frete personalizado por produto
- ✅ Status ativo/inativo

### 👥 Gestão de Clientes
- ✅ Cadastro completo de clientes
- ✅ CPF/CNPJ, telefone, endereço
- ✅ Comissão personalizada por cliente
- ✅ Status ativo/inativo

### 💰 Sistema de Vendas
- ✅ Criação de vendas com múltiplos itens
- ✅ Cálculo automático de totais
- ✅ Aplicação de descontos
- ✅ Cálculo automático de frete
- ✅ Cálculo automático de comissão
- ✅ Histórico completo de vendas

### ⚙️ Sistema de Configurações
- ✅ Configuração de frete fixo global
- ✅ Configuração de comissão padrão
- ✅ Alteração de senha do administrador
- ✅ Interface intuitiva com abas

### 🔐 Autenticação e Segurança
- ✅ Login seguro com Supabase Auth
- ✅ Sessões persistentes
- ✅ Proteção de rotas
- ✅ Logout seguro

### 📊 Dashboard e Relatórios
- ✅ Visão geral do sistema
- ✅ Estatísticas de vendas
- ✅ Controle de estoque
- ✅ Interface responsiva

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estado**: TanStack Query (React Query)
- **Roteamento**: React Router DOM
- **Build**: Vite
- **Ícones**: Lucide React

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🔧 Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd cerasa-mercadoria-gestor
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

**⚠️ IMPORTANTE**: Execute a migração do banco de dados antes de usar o sistema!

1. Acesse o [Painel do Supabase](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute o SQL completo do arquivo `INSTRUCOES_CONFIGURACOES.md`

Ou execute o arquivo de migração completo:
```bash
# O arquivo database_migration_complete.sql contém toda a estrutura necessária
```

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:8082`

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `produtos`
- `id` (UUID) - Chave primária
- `nome` (TEXT) - Nome do produto
- `descricao` (TEXT) - Descrição do produto
- `preco` (DECIMAL) - Preço unitário
- `estoque` (INTEGER) - Quantidade em estoque
- `categoria` (TEXT) - Categoria do produto
- `frete` (DECIMAL) - Frete personalizado
- `ativo` (BOOLEAN) - Status ativo/inativo
- `created_at`, `updated_at` (TIMESTAMP)

#### `clientes`
- `id` (UUID) - Chave primária
- `nome` (TEXT) - Nome do cliente
- `email` (TEXT) - Email do cliente
- `telefone` (TEXT) - Telefone do cliente
- `cpf_cnpj` (TEXT) - CPF ou CNPJ
- `endereco` (TEXT) - Endereço completo
- `cidade` (TEXT) - Cidade
- `estado` (TEXT) - Estado
- `cep` (TEXT) - CEP
- `comissao_personalizada` (DECIMAL) - Comissão específica
- `ativo` (BOOLEAN) - Status ativo/inativo
- `created_at`, `updated_at` (TIMESTAMP)

#### `vendas`
- `id` (UUID) - Chave primária
- `cliente_id` (UUID) - Referência ao cliente
- `total` (DECIMAL) - Valor total da venda
- `desconto` (DECIMAL) - Desconto aplicado
- `frete` (DECIMAL) - Valor do frete
- `tipo_frete` (TEXT) - Tipo de frete
- `comissao_percentual` (DECIMAL) - Percentual de comissão
- `comissao_valor` (DECIMAL) - Valor da comissão
- `status` (TEXT) - Status da venda
- `observacoes` (TEXT) - Observações
- `created_at`, `updated_at` (TIMESTAMP)

#### `itens_venda`
- `id` (UUID) - Chave primária
- `venda_id` (UUID) - Referência à venda
- `produto_id` (UUID) - Referência ao produto
- `quantidade` (INTEGER) - Quantidade vendida
- `preco_unitario` (DECIMAL) - Preço unitário na venda
- `subtotal` (DECIMAL) - Subtotal do item
- `created_at` (TIMESTAMP)

#### `configuracoes`
- `id` (UUID) - Chave primária
- `chave` (TEXT) - Chave única da configuração
- `valor` (JSONB) - Valor da configuração
- `created_at`, `updated_at` (TIMESTAMP)

### Triggers e Funções

#### `calcular_comissao_venda()`
Função que calcula automaticamente a comissão nas vendas com a seguinte prioridade:
1. Comissão definida na venda
2. Comissão personalizada do cliente
3. Comissão global configurada
4. Comissão padrão (5%)

#### `update_updated_at_column()`
Função que atualiza automaticamente o campo `updated_at` nas tabelas.

## 🎯 Como Usar o Sistema

### 1. Login
- Acesse o sistema com suas credenciais
- O sistema lembrará suas credenciais se marcado

### 2. Configurações Iniciais
1. Clique no perfil (canto superior direito)
2. Selecione "Configurações"
3. Configure:
   - **Frete Fixo**: Valor padrão de frete (ex: R$ 15,00)
   - **Comissão Personalizada**: Percentual padrão (ex: 5%)
   - **Senha**: Altere sua senha se necessário

### 3. Cadastro de Produtos
1. Vá para "Produtos" no menu lateral
2. Clique em "Novo Produto"
3. Preencha os dados:
   - Nome, descrição, preço, estoque
   - Categoria (opcional)
   - Frete personalizado (opcional - se não definido, usa o frete fixo)

### 4. Cadastro de Clientes
1. Vá para "Clientes" no menu lateral
2. Clique em "Novo Cliente"
3. Preencha os dados:
   - Informações pessoais
   - Endereço completo
   - Comissão personalizada (opcional - se não definido, usa a comissão global)

### 5. Criação de Vendas
1. Vá para "Vendas" no menu lateral
2. Clique em "Nova Venda"
3. Selecione o cliente
4. Adicione produtos:
   - Escolha o produto
   - Defina a quantidade
   - O sistema calculará automaticamente:
     - Subtotal por item
     - Total da venda
     - Frete (baseado nos produtos ou frete fixo)
     - Comissão (baseada na prioridade definida)
5. Aplique desconto se necessário
6. Adicione observações
7. Finalize a venda

### 6. Relatórios e Dashboard
- **Dashboard**: Visão geral com estatísticas
- **Produtos**: Lista com controle de estoque
- **Clientes**: Histórico de compras
- **Vendas**: Relatório completo de vendas

## 🔧 Configurações Avançadas

### Frete
- **Frete Fixo**: Valor padrão aplicado quando o produto não tem frete personalizado
- **Frete por Produto**: Cada produto pode ter seu próprio valor de frete
- **Cálculo**: O sistema usa o frete do produto, se não definido, usa o frete fixo

### Comissão
- **Comissão Global**: Percentual padrão configurado no sistema
- **Comissão por Cliente**: Cada cliente pode ter um percentual específico
- **Comissão por Venda**: Cada venda pode ter um percentual específico
- **Prioridade**: Venda > Cliente > Global > Padrão (5%)
- **Cálculo Automático**: Trigger calcula automaticamente ao criar/atualizar vendas

## 🚨 Solução de Problemas

### Erro: "Tabela configurações não existe"
1. Execute a migração completa do banco de dados
2. Siga as instruções em `INSTRUCOES_CONFIGURACOES.md`
3. Verifique se tem permissões no Supabase

### Erro: "Could not find the 'frete' column"
1. Execute a migração que adiciona a coluna frete
2. Verifique se a migração foi executada corretamente

### Erro: "Comissão não está sendo calculada"
1. Verifique se o trigger `calcular_comissao_venda` existe
2. Execute a migração completa
3. Verifique se há configurações na tabela `configuracoes`

## 📁 Estrutura do Projeto

```
cerasa-mercadoria-gestor/
├── src/
│   ├── components/          # Componentes React
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── Header.tsx      # Cabeçalho da aplicação
│   │   ├── ProfileDropdown.tsx  # Menu do usuário
│   │   ├── SettingsModal.tsx    # Modal de configurações
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   │   ├── useClientes.ts  # Hook para clientes
│   │   ├── useProdutos.ts  # Hook para produtos
│   │   ├── useVendas.ts    # Hook para vendas
│   │   └── ...
│   ├── integrations/       # Integrações externas
│   │   └── supabase/       # Configuração do Supabase
│   ├── pages/              # Páginas da aplicação
│   └── lib/                # Utilitários
├── database_migration_complete.sql  # Migração completa
├── INSTRUCOES_CONFIGURACOES.md     # Instruções de setup
├── package.json
└── README.md
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico:
1. Verifique a documentação
2. Consulte os arquivos de instruções
3. Verifique se a migração do banco foi executada
4. Entre em contato com o desenvolvedor

---

**🎉 Sistema pronto para uso após executar a migração do banco de dados!**
