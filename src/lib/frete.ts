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
  itens: { produto_id: string; quantidade: number; produto?: { nome: string; frete?: number | null } }[],
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
      const detalhesItens: string[] = [];
      for (const item of itens) {
        const produto = item.produto;
        let freteItem = 0;
    
        // Verificar se o produto tem frete personalizado definido (incluindo zero)
        if (produto && produto.frete !== null && produto.frete !== undefined) {
          // Usar frete personalizado do produto (mesmo que seja zero)
          freteItem = produto.frete * item.quantidade;
          detalhesItens.push(`${produto.nome}: ${item.quantidade} × R$ ${produto.frete.toFixed(2)} = R$ ${freteItem.toFixed(2)}`);
        } else {
          // Não exibir valores "padrão" na descrição
          if (typeof config.fretePadrao === 'number' && config.fretePadrao > 0) {
            freteItem = config.fretePadrao * item.quantidade;
            detalhesItens.push(`${produto?.nome || 'Produto'}: ${item.quantidade} × frete do sistema aplicado`);
          } else {
            freteItem = 0;
            detalhesItens.push(`${produto?.nome || 'Produto'}: sem frete personalizado`);
          }
        }

        freteTotal += freteItem;
      }

      if (config.tipoCalculo === 'por_produto') {
        return {
          valorFrete: freteTotal,
          tipoFrete: 'por_produto',
          detalhes: `Frete por produto: ${detalhesItens.join(', ')}`
        };
      }

      if (config.tipoCalculo === 'por_pedido') {
        const v = typeof config.fretePadrao === 'number' ? config.fretePadrao : 0;
        return {
          valorFrete: v,
          tipoFrete: 'por_pedido',
          detalhes: v > 0 ? 'Frete fixo por pedido aplicado' : 'Sem frete definido para pedido'
        };
      }

      // Calcula frete baseado na quantidade total de produtos
      const quantidadeTotal = itens.reduce((sum, i) => sum + i.quantidade, 0);
      const fretePorQuantidade = typeof config.fretePorQuantidade === 'number' ? config.fretePorQuantidade : 0; // removido fallback 5
      const freteQuantidade = quantidadeTotal * fretePorQuantidade;

      return {
        valorFrete: freteQuantidade,
        tipoFrete: 'por_quantidade',
        detalhes: fretePorQuantidade > 0
          ? 'Frete por quantidade aplicado'
          : 'Frete por quantidade não definido'
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