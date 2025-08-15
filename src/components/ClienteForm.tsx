import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Info } from 'lucide-react';
import { Cliente } from '@/hooks/useClientes';
import { useComissaoConfig } from '@/hooks/useComissaoConfig';

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ClienteForm({ cliente, onSubmit, onCancel, isLoading }: ClienteFormProps) {
  const { config: comissaoConfig } = useComissaoConfig();
  
  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    cpf_cnpj: cliente?.cpf_cnpj || '',
    endereco: cliente?.endereco || '',
    cidade: cliente?.cidade || '',
    estado: cliente?.estado || '',
    cep: cliente?.cep || '',
    comissao_personalizada: cliente?.comissao_personalizada?.toString() || '',
    ativo: cliente?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nome: formData.nome,
      email: formData.email || undefined,
      telefone: formData.telefone || undefined,
      cpf_cnpj: formData.cpf_cnpj || undefined,
      endereco: formData.endereco || undefined,
      cidade: formData.cidade || undefined,
      estado: formData.estado || undefined,
      cep: formData.cep || undefined,
      comissao_personalizada: formData.comissao_personalizada ? parseFloat(formData.comissao_personalizada) : undefined,
      ativo: formData.ativo
    });
  };

  // Calcular comissão efetiva
  const comissaoEfetiva = formData.comissao_personalizada 
    ? parseFloat(formData.comissao_personalizada) 
    : (comissaoConfig?.comissaoPersonalizada || comissaoConfig?.comissaoPadrao || 5.0);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{cliente ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="comissao_personalizada" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Comissão Personalizada (%)
            </Label>
            <Input
              id="comissao_personalizada"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.comissao_personalizada}
              onChange={(e) => setFormData({ ...formData, comissao_personalizada: e.target.value })}
              placeholder="Ex: 5.5 (deixe vazio para usar padrão)"
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Comissão Efetiva: {comissaoEfetiva}%</p>
                  <p className="text-xs text-blue-600">
                    {formData.comissao_personalizada 
                      ? 'Comissão personalizada do cliente' 
                      : `Usando comissão do sistema (${comissaoConfig?.comissaoPersonalizada || comissaoConfig?.comissaoPadrao || 5.0}%)`
                    }
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Esta comissão será aplicada em todas as vendas deste cliente
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Salvando...' : cliente ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}