import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Save, Settings, Truck, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [freteFixo, setFreteFixo] = useState('15.00');
  const [comissaoPersonalizada, setComissaoPersonalizada] = useState('5.00');
  const [comissaoPadrao, setComissaoPadrao] = useState('5.00');

  // Carregar configurações do sistema
  useEffect(() => {
    if (isOpen) {
      loadSystemSettings();
    }
  }, [isOpen]);

  const loadSystemSettings = async () => {
    try {
      // Carregar frete fixo
      const { data: freteData } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'frete_fixo')
        .single();
      
      if (freteData && freteData.valor) {
        setFreteFixo(String(freteData.valor));
      }

      // Carregar comissão personalizada
      const { data: comissaoData } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'comissao_personalizada')
        .single();
      
      if (comissaoData && comissaoData.valor) {
        setComissaoPersonalizada(String(comissaoData.valor));
      }

      // Carregar comissão padrão
      const { data: comissaoPadraoData } = await supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', 'comissao_padrao')
        .single();
      
      if (comissaoPadraoData && comissaoPadraoData.valor) {
        setComissaoPadrao(String(comissaoPadraoData.valor));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: `Erro ao alterar senha: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleFreteUpdate = async () => {
    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({
          chave: 'frete_fixo',
          valor: parseFloat(freteFixo)
        }, {
          onConflict: 'chave'
        });

      if (error) {
        console.error('Erro ao atualizar frete:', error);
        throw error;
      }

      toast({
        title: "Frete atualizado",
        description: `Frete fixo definido para R$ ${freteFixo}.`,
      });
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar frete: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleComissaoUpdate = async () => {
    try {
      const updates = [
        {
          chave: 'comissao_personalizada',
          valor: parseFloat(comissaoPersonalizada)
        },
        {
          chave: 'comissao_padrao',
          valor: parseFloat(comissaoPadrao)
        }
      ];

      const { error } = await supabase
        .from('configuracoes')
        .upsert(updates, {
          onConflict: 'chave'
        });

      if (error) {
        console.error('Erro ao atualizar comissão:', error);
        throw error;
      }

      toast({
        title: "Comissão atualizada",
        description: `Comissão personalizada: ${comissaoPersonalizada}%, Comissão padrão: ${comissaoPadrao}%.`,
      });
    } catch (error) {
      console.error('Erro completo:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar comissão: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações de Frete */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Configurações de Frete
              </CardTitle>
              <CardDescription>
                Configure o valor padrão de frete para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="freteFixo">Frete Fixo (R$)</Label>
                <Input
                  id="freteFixo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={freteFixo}
                  onChange={(e) => setFreteFixo(e.target.value)}
                  placeholder="15.00"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valor padrão de frete aplicado quando produtos não têm frete personalizado
                </p>
              </div>
              <Button onClick={handleFreteUpdate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configuração de Frete
              </Button>
            </CardContent>
          </Card>

          {/* Configurações de Comissão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Configurações de Comissão
              </CardTitle>
              <CardDescription>
                Configure os percentuais de comissão do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="comissaoPadrao">Comissão Padrão (%)</Label>
                <Input
                  id="comissaoPadrao"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={comissaoPadrao}
                  onChange={(e) => setComissaoPadrao(e.target.value)}
                  placeholder="5.00"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentual padrão aplicado quando não há comissão personalizada
                </p>
              </div>
              <div>
                <Label htmlFor="comissaoPersonalizada">Comissão Personalizada (%)</Label>
                <Input
                  id="comissaoPersonalizada"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={comissaoPersonalizada}
                  onChange={(e) => setComissaoPersonalizada(e.target.value)}
                  placeholder="5.00"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Percentual personalizado que pode ser usado em vendas específicas
                </p>
              </div>
              <Button onClick={handleComissaoUpdate} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações de Comissão
              </Button>
            </CardContent>
          </Card>

          {/* Alteração de Senha */}
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Altere sua senha de acesso ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}