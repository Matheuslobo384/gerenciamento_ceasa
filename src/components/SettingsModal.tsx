import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Lock, Truck, Percent, Eye, EyeOff } from 'lucide-react';
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

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
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
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha.",
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
        description: `Erro ao atualizar frete fixo: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleComissaoUpdate = async () => {
    try {
      const { error } = await supabase
        .from('configuracoes')
        .upsert({
          chave: 'comissao_personalizada',
          valor: parseFloat(comissaoPersonalizada)
        }, {
          onConflict: 'chave'
        });

      if (error) {
        console.error('Erro ao atualizar comissão:', error);
        throw error;
      }

      toast({
        title: "Comissão atualizada",
        description: `Comissão personalizada definida para ${comissaoPersonalizada}%.`,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Configurações do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="password" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="frete">Frete</TabsTrigger>
            <TabsTrigger value="comissao">Comissão</TabsTrigger>
          </TabsList>
          
          <TabsContent value="password" className="space-y-4">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Senha Atual
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Digite a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirme a nova senha"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <Button type="submit" className="w-full">
                Alterar Senha
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="frete" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="freteFixo" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Frete Fixo (R$)
                </Label>
                <Input
                  id="freteFixo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={freteFixo}
                  onChange={(e) => setFreteFixo(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Este valor será aplicado como frete fixo em todo o sistema.
                </p>
              </div>
              
              <Button onClick={handleFreteUpdate} className="w-full">
                Salvar Frete Fixo
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="comissao" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comissaoPersonalizada" className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Comissão Personalizada (%)
                </Label>
                <Input
                  id="comissaoPersonalizada"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={comissaoPersonalizada}
                  onChange={(e) => setComissaoPersonalizada(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Este percentual será aplicado como comissão em todo o sistema.
                </p>
              </div>
              
              <Button onClick={handleComissaoUpdate} className="w-full">
                Salvar Comissão Personalizada
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}