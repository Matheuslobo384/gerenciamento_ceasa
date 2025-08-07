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

// Função de frete expresso removida conforme solicitação do usuário
// O sistema agora permite apenas frete manual definido pelo administrador