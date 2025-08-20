import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calcularFrete } from '@/lib/frete';
import { useFreteConfig } from '@/hooks/useFreteConfig';
import { useProdutos } from '@/hooks/useProdutos';

interface ItemTeste {
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

function TesteFreteQuantidade() {
  const { config: freteConfig } = useFreteConfig();
  const { produtos } = useProdutos();
  
  const [itens, setItens] = useState<ItemTeste[]>([
    { produto_id: '', quantidade: 2, preco_unitario: 50 },
    { produto_id: '', quantidade: 3, preco_unitario: 30 },
    { produto_id: '', quantidade: 1, preco_unitario: 100 }
  ]);

  const updateItem = (index: number, field: keyof ItemTeste, value: string | number) => {
    const newItens = [...itens];
    newItens[index] = { ...newItens[index], [field]: value };
    setItens(newItens);
  };

  const addItem = () => {
    setItens([...itens, { produto_id: '', quantidade: 1, preco_unitario: 0 }]);
  };

  const removeItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // Preparar itens com produtos
  const itensComProdutos = itens.map(item => ({
    ...item,
    produto: produtos.find(p => p.id === item.produto_id)
  }));

  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
  
  // Calcular frete para cada tipo
  const configPorQuantidade = { ...freteConfig, tipoCalculo: 'por_quantidade' as const };
  const configPorProduto = { ...freteConfig, tipoCalculo: 'por_produto' as const };
  const configPorPedido = { ...freteConfig, tipoCalculo: 'por_pedido' as const };
  
  const resultadoPorQuantidade = calcularFrete(itensComProdutos, configPorQuantidade, subtotal);
  const resultadoPorProduto = calcularFrete(itensComProdutos, configPorProduto, subtotal);
  const resultadoPorPedido = calcularFrete(itensComProdutos, configPorPedido, subtotal);

  // Cálculo manual para verificação
  const quantidadeTotal = itens.reduce((total, item) => total + item.quantidade, 0);
  const freteManualPorQuantidade = quantidadeTotal * (freteConfig.fretePorQuantidade || 5);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Cálculo de Frete por Quantidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configurações atuais */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-foreground">Configurações Atuais:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>Frete Padrão: R$ {freteConfig.fretePadrao}</div>
              <div>Tipo Cálculo: {freteConfig.tipoCalculo}</div>
              <div>Frete por Quantidade: R$ {freteConfig.fretePorQuantidade}</div>
            </div>
          </div>

          {/* Itens de teste */}
          <div>
            <h3 className="font-semibold mb-2 text-foreground">Itens de Teste:</h3>
            {itens.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <Select
                  value={item.produto_id}
                  onValueChange={(value) => updateItem(index, 'produto_id', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {produtos.map(produto => (
                      <SelectItem key={produto.id} value={produto.id}>
                        {produto.nome} (Frete: {produto.frete ? `R$ ${produto.frete}` : 'Padrão'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateItem(index, 'quantidade', isNaN(value) ? 0 : value);
                  }}
                  className="w-20"
                  placeholder="Qtd"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={item.preco_unitario}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    updateItem(index, 'preco_unitario', isNaN(value) ? 0 : value);
                  }}
                  className="w-24"
                  placeholder="Preço"
                />
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeItem(index)}
                >
                  ❌
                </Button>
              </div>
            ))}
            <Button onClick={addItem} variant="outline" size="sm">
              ➕ Adicionar Item
            </Button>
          </div>

          {/* Cálculos */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-foreground">📊 Cálculos:</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div>Subtotal: R$ {subtotal.toFixed(2)}</div>
              <div>Quantidade Total: {quantidadeTotal} produtos</div>
              <div className="font-semibold text-primary">
                Cálculo Manual por Quantidade: {quantidadeTotal} × R$ {freteConfig.fretePorQuantidade} = R$ {freteManualPorQuantidade.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-green-600">Por Quantidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">
                  R$ {resultadoPorQuantidade.valorFrete.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {resultadoPorQuantidade.detalhes}
                </div>
                <div className={`text-xs mt-2 p-2 rounded ${resultadoPorQuantidade.valorFrete === freteManualPorQuantidade ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                  ✅ {resultadoPorQuantidade.valorFrete === freteManualPorQuantidade ? 'CORRETO' : 'ERRO'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-blue-600">Por Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-500">
                  R$ {resultadoPorProduto.valorFrete.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {resultadoPorProduto.detalhes}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-500/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-purple-600">Por Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-500">
                  R$ {resultadoPorPedido.valorFrete.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {resultadoPorPedido.detalhes}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info */}
          <details className="bg-muted p-4 rounded">
            <summary className="cursor-pointer font-semibold text-foreground">🔍 Debug Info</summary>
            <pre className="text-xs mt-2 overflow-auto text-muted-foreground">
              {JSON.stringify({
                freteConfig,
                itensComProdutos: itensComProdutos.map(item => ({
                  ...item,
                  produto: item.produto ? {
                    id: item.produto.id,
                    nome: item.produto.nome,
                    frete: item.produto.frete
                  } : null
                })),
                quantidadeTotal,
                freteManualPorQuantidade,
                resultados: {
                  porQuantidade: resultadoPorQuantidade,
                  porProduto: resultadoPorProduto,
                  porPedido: resultadoPorPedido
                }
              }, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}

export default TesteFreteQuantidade;