import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Truck, Percent, Info } from 'lucide-react';
import { useClientes } from '@/hooks/useClientes';
import { useProdutos } from '@/hooks/useProdutos';
import { useFreteConfig } from '@/hooks/useFreteConfig';
import { useComissaoConfig } from '@/hooks/useComissaoConfig';
import { calcularFrete } from '@/lib/frete';

interface ItemVenda {
  id: string; // Adicionando ID único para cada item
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
}

interface VendaCompleta {
  id: string;
  cliente_id?: string | null;
  total: number;
  desconto?: number | null;
  frete?: number | null;
  tipo_frete?: string | null;
  status: string;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
  comissao_percentual?: number | null;
  clientes?: { nome: string };
  itens_venda: {
    id: string;
    venda_id?: string | null;
    produto_id?: string | null;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    created_at: string;
    produtos: { nome: string };
  }[];
}

interface VendaFormProps {
  venda?: VendaCompleta;
  onSubmit: (venda: {
    cliente_id?: string;
    total: number;
    desconto?: number;
    status: string;
    observacoes?: string;
    itens: Omit<ItemVenda, 'id'>[];
    frete?: number;
    tipo_frete?: string;
    comissao_percentual?: number;
  }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function VendaForm({ venda, onSubmit, onCancel, isLoading }: VendaFormProps) {
  const { clientes, isLoading: clientesLoading } = useClientes();
  const { produtos, isLoading: produtosLoading } = useProdutos();
  const { config: freteConfig } = useFreteConfig();
  const { config: comissaoConfig } = useComissaoConfig();
  const isMountedRef = useRef(true);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    desconto: '',
    status: 'pendente',
    observacoes: '',
    comissao_percentual: '',
    frete_manual: '',
    usar_frete_manual: false
  });

  const [itens, setItens] = useState<ItemVenda[]>([{
    id: crypto.randomUUID(), // ID único para o primeiro item
    produto_id: '',
    quantidade: 1,
    preco_unitario: 0
  }]);

  // Preencher dados quando estiver editando
  useEffect(() => {
    if (venda) {
      setFormData({
        cliente_id: venda.cliente_id || '',
        desconto: venda.desconto?.toString() || '',
        status: venda.status,
        observacoes: venda.observacoes || '',
        comissao_percentual: venda.comissao_percentual?.toString() || '',
        frete_manual: venda.frete?.toString() || '',
        usar_frete_manual: !!venda.frete
      });
      
      if (venda.itens_venda && venda.itens_venda.length > 0) {
        setItens(venda.itens_venda.map(item => ({
          id: crypto.randomUUID(),
          produto_id: item.produto_id || '',
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario
        })));
      }
    }
  }, [venda]);

  const addItem = () => {
    if (!isMountedRef.current) return;
    setItens(prevItens => [...prevItens, { 
      id: crypto.randomUUID(), // ID único para cada novo item
      produto_id: '', 
      quantidade: 1, 
      preco_unitario: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (!isMountedRef.current) return;
    setItens(prevItens => prevItens.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Omit<ItemVenda, 'id'>, value: string | number) => {
    if (!isMountedRef.current) return;
    setItens(prevItens => prevItens.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateProdutoItem = (id: string, produtoId: string) => {
    if (!isMountedRef.current) return;
    const produto = produtos.find(p => p.id === produtoId);
    if (produto) {
      setItens(prevItens => prevItens.map(item => 
        item.id === id 
          ? { ...item, produto_id: produtoId, preco_unitario: produto.preco }
          : item
      ));
    }
  };

  // Calcular subtotal
  const subtotal = itens.reduce((acc, item) => acc + (item.quantidade * item.preco_unitario), 0);
  
  // Calcular frete
  const itensComProdutos = itens.map(item => ({
    ...item,
    produto: produtos.find(p => p.id === item.produto_id)
  }));
  
  const calculoFrete = calcularFrete(itensComProdutos, freteConfig, subtotal);
  
  // Usar frete manual se especificado pelo administrador
  const valorFrete = formData.usar_frete_manual ? 
    (parseFloat(formData.frete_manual) || 0) : 
    calculoFrete.valorFrete;
  
  const desconto = parseFloat(formData.desconto) || 0;
  
  // ✅ CORREÇÃO: Total = Subtotal dos produtos - Desconto
  // Frete e comissão são despesas da empresa, não somadas ao que cliente paga
  const total = subtotal - desconto;
  
  // Calcular comissão para exibição
  const comissaoPercentual = parseFloat(formData.comissao_percentual) || 10;
  const comissaoValor = (subtotal * comissaoPercentual / 100);
  
  // Calcular o que o cliente realmente vai pagar
  const totalCliente = subtotal - valorFrete - comissaoValor - desconto;
  
  // Calcular comissão atual baseada na prioridade
  const calcularComissaoAtual = () => {
    if (formData.comissao_percentual) {
      return {
        percentual: parseFloat(formData.comissao_percentual),
        origem: 'Venda (Personalizada)'
      };
    }
    
    const clienteSelecionado = clientes?.find(c => c.id === formData.cliente_id);
    if (clienteSelecionado?.comissao_personalizada) {
      return {
        percentual: clienteSelecionado.comissao_personalizada,
        origem: 'Cliente'
      };
    }
    
    if (comissaoConfig?.comissaoPersonalizada) {
      return {
        percentual: comissaoConfig.comissaoPersonalizada,
        origem: 'Sistema (Personalizada)'
      };
    }
    
    return {
      percentual: comissaoConfig?.comissaoPadrao || 5.0,
      origem: 'Sistema (Padrão)'
    };
  };

  const comissaoAtual = calcularComissaoAtual();

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!isMountedRef.current) return;
      
      const itensValidos = itens.filter(item => item.produto_id && item.quantidade > 0);
      
      if (itensValidos.length === 0) {
        alert('Adicione pelo menos um item à venda');
        return;
      }
  
      // Removendo o ID dos itens antes de enviar
      const itensParaEnviar = itensValidos.map(({ id, ...item }) => item);
  
      onSubmit({
          cliente_id: formData.cliente_id || undefined,
          total, // Apenas subtotal dos produtos - desconto
          desconto: desconto || undefined,
          status: formData.status,
          observacoes: formData.observacoes || undefined,
          itens: itensParaEnviar,
          frete: valorFrete,
          tipo_frete: formData.usar_frete_manual ? 'manual' : calculoFrete.tipoFrete,
          comissao_percentual: formData.comissao_percentual ? parseFloat(formData.comissao_percentual) : undefined
        });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{venda ? 'Editar Venda' : 'Nova Venda'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                {clientesLoading ? (
                  <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Carregando clientes...</span>
                  </div>
                ) : (
                  <select
                    id="cliente"
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes && clientes.length > 0 ? (
                      clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Nenhum cliente cadastrado
                      </option>
                    )}
                  </select>
                )}
                {clientesLoading && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Carregando clientes...
                  </p>
                )}
                {!clientesLoading && clientes && clientes.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Cadastre um cliente primeiro para continuar
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="comissao_percentual">Comissão Personalizada (%)</Label>
                <Input
                  id="comissao_percentual"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.comissao_percentual}
                  onChange={(e) => setFormData({ ...formData, comissao_percentual: e.target.value })}
                  placeholder="Ex: 10.00 (deixe vazio para usar automático)"
                />
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Comissão Atual: {comissaoAtual.percentual}%</p>
                      <p className="text-xs text-blue-600">Origem: {comissaoAtual.origem}</p>
                      {formData.comissao_percentual && (
                        <p className="text-xs text-blue-600 mt-1">
                          ⚠️ Esta comissão personalizada sobrescreverá todas as outras configurações
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="usar_frete_manual">Frete Manual (Admin)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="usar_frete_manual"
                    checked={formData.usar_frete_manual}
                    onChange={(e) => setFormData({ ...formData, usar_frete_manual: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="usar_frete_manual" className="text-sm">Definir frete manualmente</Label>
                </div>
                {formData.usar_frete_manual && (
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.frete_manual}
                    onChange={(e) => setFormData({ ...formData, frete_manual: e.target.value })}
                    placeholder="Valor do frete"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Itens da Venda</CardTitle>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {itens.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Label>Produto</Label>
                  <Select value={item.produto_id} onValueChange={(value) => updateProdutoItem(item.id, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome} - R$ {produto.preco.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Qtd</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.quantidade === 0 ? '' : item.quantidade}
                    onChange={(e) => updateItem(item.id, 'quantidade', e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                    className="text-center font-mono" // Centralizar e usar fonte monoespaçada
                  />
                </div>

                <div className="col-span-2">
                  <Label>Preço</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.preco_unitario}
                    onChange={(e) => updateItem(item.id, 'preco_unitario', parseFloat(e.target.value) || 0)}
                    className="text-right font-mono" // Alinhar à direita e usar fonte monoespaçada
                  />
                </div>

                <div className="col-span-2">
                  <Label>Subtotal</Label>
                  <Input
                    value={`R$ ${(item.quantidade * item.preco_unitario).toFixed(2)}`}
                    readOnly
                    className="bg-muted text-right font-mono font-semibold" // Alinhar à direita, fonte monoespaçada e negrito
                  />
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={itens.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Frete:</span>
              <div className="text-right">
                <div className="font-medium">
                  {valorFrete === 0 ? 'Grátis' : `R$ ${valorFrete.toFixed(2)}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formData.usar_frete_manual ? 
                    'Frete definido manualmente' : 
                    calculoFrete.detalhes
                  }
                </div>
                {!formData.usar_frete_manual && freteConfig && (
                  <div className="text-xs text-blue-600">
                    Config: {freteConfig.tipoCalculo} | Padrão: R$ {freteConfig.fretePadrao.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <Label htmlFor="desconto">(-) Desconto:</Label>
              <Input
                id="desconto"
                type="number"
                step="0.01"
                value={formData.desconto}
                onChange={(e) => setFormData({ ...formData, desconto: e.target.value })}
                className="w-32"
                placeholder="0.00"
              />
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-bold text-green-600">
                <span>Total que Cliente Paga:</span>
                <span>R$ {totalCliente.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? 'Salvando...' : 'Criar Venda'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}