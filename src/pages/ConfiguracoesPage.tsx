import { FreteConfig } from '@/components/FreteConfig';
import { ComissaoConfig } from '@/components/ComissaoConfig';
import { useFreteConfig } from '@/hooks/useFreteConfig';
import { useComissaoConfig } from '@/hooks/useComissaoConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Truck, Package, Percent } from 'lucide-react';

function ConfiguracoesPage() {
  const { config: freteConfig, updateConfig: updateFreteConfig, isLoading: freteLoading } = useFreteConfig();
  const { config: comissaoConfig, updateConfig: updateComissaoConfig, isLoading: comissaoLoading } = useComissaoConfig();

  const handleSaveFreteConfig = (newConfig: any) => {
    updateFreteConfig.mutate(newConfig);
  };

  const handleSaveComissaoConfig = (newConfig: any) => {
    updateComissaoConfig.mutate(newConfig);
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
          isLoading={updateFreteConfig.isPending}
          initialConfig={freteConfig}
        />

        {/* Configurações de Comissão */}
        <ComissaoConfig 
          onSave={handleSaveComissaoConfig}
          isLoading={updateComissaoConfig.isPending}
          initialConfig={comissaoConfig}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Se um produto não tiver frete personalizado definido, 
                o sistema usará o frete padrão configurado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informações sobre Comissão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Informações sobre Comissão
            </CardTitle>
            <CardDescription>
              Como o sistema calcula a comissão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Comissão por Venda</h4>
                <p className="text-sm text-muted-foreground">
                  Pode ser definida individualmente em cada venda, 
                  sobrescrevendo todas as outras configurações.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Comissão por Cliente</h4>
                <p className="text-sm text-muted-foreground">
                  Cada cliente pode ter um percentual específico de comissão 
                  que será aplicado em todas as suas vendas.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Comissão Personalizada</h4>
                <p className="text-sm text-muted-foreground">
                  Valor configurável no sistema que pode ser usado 
                  quando não há comissão específica definida.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Comissão Padrão</h4>
                <p className="text-sm text-muted-foreground">
                  Valor padrão aplicado quando nenhuma outra comissão 
                  está definida (padrão: 5%).
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Prioridade:</strong> Venda > Cliente > Personalizada > Padrão
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ConfiguracoesPage;