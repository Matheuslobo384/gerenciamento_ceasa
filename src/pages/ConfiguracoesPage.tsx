import { FreteConfig } from '@/components/FreteConfig';
import { useFreteConfig } from '@/hooks/useFreteConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Truck, Package } from 'lucide-react';

function ConfiguracoesPage() {
  const { config, updateConfig, isLoading } = useFreteConfig();

  const handleSaveFreteConfig = (newConfig: any) => {
    updateConfig.mutate(newConfig);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Frete */}
        <FreteConfig 
          onSave={handleSaveFreteConfig}
          isLoading={updateConfig.isPending}
          initialConfig={config}
        />

        {/* Informações sobre Frete */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações sobre Frete
            </CardTitle>
            <CardDescription>
              Como o sistema calcula o frete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Por Produto (Individual)</h4>
                <p className="text-sm text-muted-foreground">
                  Cada produto pode ter seu próprio valor de frete definido. 
                  O frete total será a soma dos fretes individuais.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Por Pedido (Fixo)</h4>
                <p className="text-sm text-muted-foreground">
                  Valor fixo de frete para todo o pedido, independente 
                  da quantidade de produtos.
                </p>
              </div>



              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Por Quantidade de Produtos</h4>
                <p className="text-sm text-muted-foreground">
                  Frete calculado multiplicando a quantidade total de produtos 
                  vendidos pelo valor configurado por produto.
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Configuração Atual</h4>
              <div className="text-sm space-y-1">
                <p><strong>Tipo:</strong> {config.tipoCalculo === 'por_produto' ? 'Por Produto' : 
                                          config.tipoCalculo === 'por_pedido' ? 'Por Pedido' : 
                                          config.tipoCalculo === 'por_quantidade' ? 'Por Quantidade' : 'Não definido'}</p>
                <p><strong>Frete Padrão:</strong> R$ {config.fretePadrao.toFixed(2)}</p>
                {config.tipoCalculo === 'por_quantidade' && (
                  <p><strong>Frete por Produto:</strong> R$ {(config.fretePorQuantidade || 5).toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConfiguracoesPage;