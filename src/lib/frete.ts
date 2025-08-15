import { FreteConfig } from '@/components/FreteConfig';
import { Produto } from '@/hooks/useProdutos';

export interface ItemVenda {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  produto?: Produto;
}

export interface CalculoFreteResult {
  valorFrete: number;
  tipoFrete: string;
  detalhes: string;
}

export function calcularFrete(
  itens: ItemVenda[],
  config: FreteConfig,
  subtotal: number
): CalculoFreteResult {

  // Se não há itens, retornar frete zero
  if (!itens || itens.length === 0) {
    return {
      valorFrete: 0,
      tipoFrete: 'sem_itens',
      detalhes: 'Nenhum item para calcular frete'
    };
  }

  switch (config.tipoCalculo) {
    case 'por_produto':
      // Soma os fretes individuais de cada produto
      let freteTotal = 0;
      let detalhesItens: string[] = [];
      
      itens.forEach(item => {
        const produto = item.produto;
        let freteItem = 0;
        
        if (produto && produto.frete !== null && produto.frete !== undefined) {
          // Usar frete personalizado do produto
          freteItem = produto.frete * item.quantidade;
          detalhesItens.push(`${produto.nome}: ${item.quantidade} × R$ ${produto.frete.toFixed(2)} = R$ ${freteItem.toFixed(2)}`);
        } else {
          // Usar frete padrão configurado
          freteItem = config.fretePadrao * item.quantidade;
          detalhesItens.push(`${produto?.nome || 'Produto'}: ${item.quantidade} × R$ ${config.fretePadrao.toFixed(2)} (padrão) = R$ ${freteItem.toFixed(2)}`);
        }
        
        freteTotal += freteItem;
      });

      return {
        valorFrete: freteTotal,
        tipoFrete: 'por_produto',
        detalhes: `Frete por produto: ${detalhesItens.join(', ')}`
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
        detalhes: `Frete por quantidade: ${quantidadeTotal} produtos × R$ ${fretePorQuantidade.toFixed(2)} = R$ ${freteQuantidade.toFixed(2)}`
      };

    default:
      return {
        valorFrete: 0,
        tipoFrete: 'sem_frete',
        detalhes: 'Frete não configurado'
      };
  }
}

// Função de frete expresso removida conforme solicitação do usuário
// O sistema agora permite apenas frete manual definido pelo administrador