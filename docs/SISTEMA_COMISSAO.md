# Sistema de Comissão Personalizada

## Visão Geral

O sistema de comissão personalizada permite configurar diferentes percentuais de comissão em múltiplos níveis, garantindo flexibilidade e controle total sobre os cálculos de comissão em todas as vendas.

## Funcionalidades Implementadas

### ✅ Configurações Globais
- **Comissão Padrão**: Percentual padrão aplicado quando não há outras configurações
- **Comissão Personalizada**: Percentual configurável para uso geral no sistema
- Interface de configuração integrada no modal de configurações

### ✅ Comissão por Cliente
- Cada cliente pode ter um percentual específico de comissão
- Aplicado automaticamente em todas as vendas do cliente
- Interface de configuração no formulário de clientes

### ✅ Comissão por Venda
- Comissão personalizada definida individualmente em cada venda
- Sobrescreve todas as outras configurações
- Interface de configuração no formulário de vendas

### ✅ Cálculo Automático
- Trigger automático que calcula comissão ao criar/atualizar vendas
- Prioridade de aplicação bem definida
- Consistência garantida em todos os relatórios

## Hierarquia de Prioridade

O sistema aplica a comissão seguindo esta ordem de prioridade:

1. **Comissão por Venda** (maior prioridade)
   - Definida individualmente em cada venda
   - Sobrescreve todas as outras configurações

2. **Comissão por Cliente**
   - Percentual específico do cliente
   - Aplicado em todas as vendas do cliente

3. **Comissão Personalizada do Sistema**
   - Configuração global personalizada
   - Usada quando não há comissão específica

4. **Comissão Padrão do Sistema** (menor prioridade)
   - Valor padrão de 5%
   - Aplicado quando nenhuma outra configuração existe

## Como Configurar

### 1. Configurações Globais

1. Clique no perfil do usuário (canto superior direito)
2. Selecione "Configurações"
3. Na seção "Configurações de Comissão":
   - **Comissão Padrão**: Defina o percentual padrão (ex: 5%)
   - **Comissão Personalizada**: Defina o percentual personalizado (ex: 7%)
4. Clique em "Salvar Configurações de Comissão"

### 2. Comissão por Cliente

1. Vá para "Clientes" no menu lateral
2. Crie um novo cliente ou edite um existente
3. No campo "Comissão Personalizada (%)":
   - Digite o percentual desejado (ex: 10%)
   - Deixe vazio para usar a configuração do sistema
4. Salve o cliente

### 3. Comissão por Venda

1. Vá para "Vendas" no menu lateral
2. Crie uma nova venda ou edite uma existente
3. No campo "Comissão Personalizada (%)":
   - Digite o percentual específico para esta venda
   - Deixe vazio para usar a comissão do cliente ou sistema
4. Complete a venda

## Interface do Usuário

### Formulário de Vendas
- Campo de comissão personalizada com validação
- Informação visual da comissão atual e sua origem
- Aviso quando comissão personalizada sobrescreve outras configurações

### Formulário de Clientes
- Campo de comissão personalizada com validação
- Exibição da comissão efetiva que será aplicada
- Informação sobre a origem da comissão (cliente ou sistema)

### Página de Configurações
- Seção dedicada para configurações de comissão
- Explicação detalhada de como funciona o sistema
- Interface intuitiva para configurar percentuais

## Cálculo Automático

### Trigger de Banco de Dados
```sql
CREATE TRIGGER trigger_calcular_comissao
    BEFORE INSERT OR UPDATE ON vendas
    FOR EACH ROW
    EXECUTE FUNCTION calcular_comissao_venda();
```

### Função de Cálculo
A função `calcular_comissao_venda()` implementa a lógica de prioridade:

1. Verifica se há comissão personalizada na venda
2. Busca comissão personalizada do cliente
3. Consulta configurações do sistema
4. Aplica comissão padrão se necessário
5. Calcula o valor da comissão automaticamente

## Relatórios e Relatórios

### Dashboard
- Exibe comissão total calculada
- Mostra estatísticas de comissão por período
- Inclui comissão nos cálculos de lucro líquido

### Relatórios de Vendas
- Lista comissão percentual e valor para cada venda
- Inclui comissão nos totais e subtotais
- Exportação para PDF e CSV com dados de comissão

### Relatórios Financeiros
- Comissão incluída nas despesas operacionais
- Cálculo correto do lucro líquido (Faturamento - Frete - Comissão)
- Análise de comissão por cliente e período

## Migração do Banco de Dados

Para implementar o sistema completo, execute a migração SQL:

```sql
-- Execute o arquivo: src/integrations/supabase/migrations/update_comissao_system.sql
```

Esta migração:
- Adiciona configuração de comissão padrão
- Atualiza função de cálculo de comissão
- Recria trigger automático
- Atualiza vendas existentes
- Cria índices para performance

## Validações e Segurança

### Validações de Entrada
- Percentual entre 0% e 100%
- Valores numéricos válidos
- Validação no frontend e backend

### Consistência de Dados
- Trigger garante cálculo automático
- Não permite valores inconsistentes
- Mantém histórico de comissões aplicadas

### Performance
- Índices otimizados para consultas
- Cálculo eficiente em triggers
- Cache de configurações no frontend

## Casos de Uso

### Caso 1: Cliente VIP com Comissão Especial
1. Configure comissão personalizada de 15% para o cliente
2. Todas as vendas deste cliente usarão 15%
3. Relatórios mostrarão comissão específica do cliente

### Caso 2: Venda Especial com Comissão Diferente
1. Em uma venda específica, defina comissão de 20%
2. Esta venda usará 20% independente do cliente
3. Outras vendas do mesmo cliente continuam com comissão normal

### Caso 3: Sistema com Comissão Padrão
1. Configure comissão padrão de 5% no sistema
2. Todas as vendas sem configuração específica usarão 5%
3. Sistema funciona automaticamente para novos clientes

## Troubleshooting

### Problema: Comissão não está sendo calculada
**Solução:**
1. Verifique se o trigger existe: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'trigger_calcular_comissao';`
2. Execute a migração SQL novamente
3. Verifique se há configurações na tabela `configuracoes`

### Problema: Comissão incorreta sendo aplicada
**Solução:**
1. Verifique a prioridade de configurações
2. Confirme se não há comissão personalizada na venda
3. Verifique comissão do cliente
4. Consulte configurações do sistema

### Problema: Performance lenta em relatórios
**Solução:**
1. Verifique se os índices foram criados
2. Execute `ANALYZE vendas;` para atualizar estatísticas
3. Considere otimizar consultas complexas

## Benefícios

### Para o Usuário
- Controle total sobre comissões
- Interface intuitiva e informativa
- Flexibilidade para diferentes cenários
- Relatórios precisos e detalhados

### Para o Sistema
- Consistência garantida nos cálculos
- Performance otimizada
- Escalabilidade para crescimento
- Manutenibilidade do código

### Para o Negócio
- Flexibilidade para diferentes estratégias de comissão
- Transparência nos relatórios
- Controle financeiro preciso
- Adaptação a diferentes tipos de cliente
