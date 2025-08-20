import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Settings, Save, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ComissaoConfig as ComissaoConfigType } from '@/hooks/useComissaoConfig';

interface ComissaoConfigProps {
  onSave: (config: ComissaoConfigType) => void;
  isLoading?: boolean;
  initialConfig?: ComissaoConfigType;
}

export function ComissaoConfig({ onSave, isLoading, initialConfig }: ComissaoConfigProps) {
  const { toast } = useToast();
  
  const [config, setConfig] = useState<ComissaoConfigType>({
    comissaoPadrao: 5.0,
    comissaoPersonalizada: 5.0
  });

  // Atualizar estado quando initialConfig mudar
  useEffect(() => {
    if (initialConfig) {
      setConfig({
        comissaoPadrao: initialConfig.comissaoPadrao,
        comissaoPersonalizada: initialConfig.comissaoPersonalizada
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
          <Percent className="h-5 w-5" />
          Configurações de Comissão
        </CardTitle>
        <CardDescription>
          Configure as opções de comissão para o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Comissão Padrão */}
          <div>
            <Label htmlFor="comissaoPadrao">Comissão Padrão (%)</Label>
            <Input
              id="comissaoPadrao"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={config.comissaoPadrao}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setConfig({ ...config, comissaoPadrao: isNaN(value) ? 0 : value });
              }}
              placeholder="5.00"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Percentual padrão aplicado quando não há comissão personalizada
            </p>
          </div>

          {/* Comissão Personalizada */}
          <div>
            <Label htmlFor="comissaoPersonalizada">Comissão Personalizada (%)</Label>
            <Input
              id="comissaoPersonalizada"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={config.comissaoPersonalizada}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setConfig({ ...config, comissaoPersonalizada: isNaN(value) ? 0 : value });
              }}
              placeholder="5.00"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Percentual personalizado que pode ser usado em vendas específicas
            </p>
          </div>

          {/* Informações sobre Comissão */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <h4 className="font-medium mb-2">Como funciona o sistema de comissão:</h4>
                <ul className="space-y-1">
                  <li>• <strong>Comissão por Venda:</strong> Pode ser definida individualmente em cada venda</li>
                  <li>• <strong>Comissão por Cliente:</strong> Cada cliente pode ter um percentual específico</li>
                  <li>• <strong>Comissão Personalizada:</strong> Valor configurável para uso geral</li>
                  <li>• <strong>Comissão Padrão:</strong> Valor padrão quando nenhuma outra está definida</li>
                </ul>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="font-medium">Prioridade de aplicação:</p>
                  <p className="text-xs">Venda {'>'} Cliente {'>'} Personalizada {'>'} Padrão</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Settings className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
