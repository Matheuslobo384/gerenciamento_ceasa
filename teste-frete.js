// Teste da lógica de cálculo de frete
// Execute com: node teste-frete.js

// Simulação da função calcularFrete
function calcularFrete(itens, config, subtotal) {
  switch (config.tipoCalculo) {
    case 'por_produto':
      // Soma os fretes individuais de cada produto
      const freteTotal = itens.reduce((total, item) => {
        const produto = item.produto;
        if (produto && produto.frete) {
          return total + (produto.frete * item.quantidade);
        }
        return total + (config.fretePadrao * item.quantidade);
      }, 0);

      return {
        valorFrete: freteTotal,
        tipoFrete: 'por_produto',
        detalhes: `Frete calculado por produto (${itens.length} itens)`
      };

    case 'por_pedido':
      // Valor fixo por pedido
      return {
        valorFrete: config.fretePadrao,
        tipoFrete: 'por_pedido',
        detalhes: `Frete fixo de R$ ${config.fretePadrao.toFixed(2)} por pedido`
      };

    case 'por_quantidade':
      // Calcula frete baseado na quantidade total de produtos
      const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
      const fretePorQuantidade = config.fretePorQuantidade || 5;
      const freteQuantidade = quantidadeTotal * fretePorQuantidade;
      
      return {
        valorFrete: freteQuantidade,
        tipoFrete: 'por_quantidade',
        detalhes: `Frete calculado por quantidade (${quantidadeTotal} produtos × R$ ${fretePorQuantidade.toFixed(2)})`
      };

    default:
      return {
        valorFrete: 0,
        tipoFrete: 'sem_frete',
        detalhes: 'Frete não configurado'
      };
  }
}

// Dados de teste
const configPorProduto = {
  tipoCalculo: 'por_produto',
  fretePadrao: 15,
  fretePorQuantidade: 5
};

const configPorPedido = {
  tipoCalculo: 'por_pedido',
  fretePadrao: 15,
  fretePorQuantidade: 5
};

const configPorQuantidade = {
  tipoCalculo: 'por_quantidade',
  fretePadrao: 15,
  fretePorQuantidade: 5
};

// Itens de teste
const itens = [
  {
    produto_id: '1',
    quantidade: 2,
    preco_unitario: 50,
    produto: { id: '1', nome: 'Produto A', frete: 10 }
  },
  {
    produto_id: '2',
    quantidade: 3,
    preco_unitario: 30,
    produto: { id: '2', nome: 'Produto B', frete: null }
  },
  {
    produto_id: '3',
    quantidade: 1,
    preco_unitario: 100,
    produto: { id: '3', nome: 'Produto C', frete: 20 }
  }
];

const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);

console.log('=== TESTE DE CÁLCULO DE FRETE ===');
console.log('Subtotal:', subtotal);
console.log('\nItens:');
itens.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.produto.nome}: ${item.quantidade}x R$ ${item.preco_unitario} (frete: ${item.produto.frete || 'padrão'})`);
});

console.log('\n=== RESULTADOS ===');

// Teste por produto
const resultadoPorProduto = calcularFrete(itens, configPorProduto, subtotal);
console.log('\n1. POR PRODUTO:');
console.log('   Valor:', `R$ ${resultadoPorProduto.valorFrete.toFixed(2)}`);
console.log('   Detalhes:', resultadoPorProduto.detalhes);
console.log('   Cálculo: Produto A (2x R$ 10) + Produto B (3x R$ 15 padrão) + Produto C (1x R$ 20) = R$ 20 + R$ 45 + R$ 20 = R$ 85');

// Teste por pedido
const resultadoPorPedido = calcularFrete(itens, configPorPedido, subtotal);
console.log('\n2. POR PEDIDO:');
console.log('   Valor:', `R$ ${resultadoPorPedido.valorFrete.toFixed(2)}`);
console.log('   Detalhes:', resultadoPorPedido.detalhes);
console.log('   Cálculo: Frete fixo independente da quantidade');

// Teste por quantidade
const resultadoPorQuantidade = calcularFrete(itens, configPorQuantidade, subtotal);
console.log('\n3. POR QUANTIDADE:');
console.log('   Valor:', `R$ ${resultadoPorQuantidade.valorFrete.toFixed(2)}`);
console.log('   Detalhes:', resultadoPorQuantidade.detalhes);
const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
console.log(`   Cálculo: ${quantidadeTotal} produtos × R$ 5 = R$ ${quantidadeTotal * 5}`);

console.log('\n=== ANÁLISE ===');
console.log('A lógica parece estar correta. Se há problemas, pode ser:');
console.log('1. Configurações não estão sendo carregadas do banco');
console.log('2. Produtos não têm o campo frete carregado');
console.log('3. Tabela configuracoes não existe no banco');
console.log('4. Interface não está exibindo os valores corretos');