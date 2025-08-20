import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FreteConfigProps {
  onSave: (config: FreteConfig) => void;
  isLoading?: boolean;
  initialConfig?: FreteConfig;
}

export interface FreteConfig {
  fretePadrao: number;
  tipoCalculo: 'por_produto' | 'por_pedido' | 'por_quantidade';
  fretePorQuantidade?: number;
}

export function FreteConfig({ onSave, isLoading, initialConfig }: FreteConfigProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<FreteConfig>({
    fretePadrao: 0, // ✅ Mudado de 15 para 0
    tipoCalculo: 'por_pedido',
    fretePorQuantidade: 0 // ✅ Mudado de 5 para 0
  });

  // Atualizar estado quando initialConfig mudar
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        fretePadrao: initialConfig.fretePadrao ?? 0, // ✅ Usar ?? em vez de || para aceitar 0
        tipoCalculo: initialConfig.tipoCalculo,
        fretePorQuantidade: initialConfig.fretePorQuantidade ?? 0 // ✅ Usar ?? em vez de || para aceitar 0
      });
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Configurações de Frete
        </CardTitle>
        <CardDescription>
          Configure as opções de frete para o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Cálculo */}
          <div>
            <Label htmlFor="tipoCalculo">Tipo de Cálculo</Label>
            <Select 
              value={config.tipoCalculo} 
              onValueChange={(value: 'por_produto' | 'por_pedido' | 'por_quantidade') => 
                setConfig({ ...config, tipoCalculo: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="por_produto">Por Produto (Individual)</SelectItem>
                <SelectItem value="por_pedido">Por Pedido (Fixo)</SelectItem>
                <SelectItem value="por_quantidade">Por quantidade de produtos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Valores de Frete */}
          <div>
            <Label htmlFor="fretePadrao">Frete Padrão (R$)</Label>
            <Input
              id="fretePadrao"
              type="number"
              step="0.01"
              value={config.fretePadrao}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || value === undefined) {
                  setConfig({ ...config, fretePadrao: 0 });
                } else {
                  const numValue = parseFloat(value);
                  setConfig({ ...config, fretePadrao: isNaN(numValue) ? 0 : numValue });
                }
              }}
              placeholder="0.00"
            />
          </div>

          {config.tipoCalculo === 'por_quantidade' && (
            <div className="space-y-2">
              <Label htmlFor="fretePorQuantidade">Valor do frete por produto (R$)</Label>
              <Input
                id="fretePorQuantidade"
                type="number"
                step="0.01"
                value={config.fretePorQuantidade ?? 0}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || value === undefined) {
                    setConfig({ ...config, fretePorQuantidade: 0 });
                  } else {
                    const numValue = parseFloat(value);
                    setConfig({ ...config, fretePorQuantidade: isNaN(numValue) ? 0 : numValue });
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                O frete será calculado multiplicando este valor pela quantidade total de produtos vendidos.
              </p>
            </div>
          )}

          {/* Informações */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como funciona:</h4>
            <ul className="text-sm space-y-1">
              <li><strong>Por Produto:</strong> Cada produto pode ter seu próprio valor de frete</li>
              <li><strong>Por Pedido:</strong> Valor fixo de frete para todo o pedido</li>
              <li><strong>Por Quantidade:</strong> Frete calculado pela quantidade total de produtos</li>
              <li><strong>Frete Manual:</strong> Administradores podem definir valores personalizados na venda</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}