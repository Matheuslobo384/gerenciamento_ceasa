import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface ComissaoConfig {
  comissaoPadrao: number;
  comissaoPersonalizada: number;
}

export function useComissaoConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: config, isLoading } = useQuery({
    queryKey: ['comissao-config'],
    queryFn: async () => {
      // Buscar configurações de comissão
      const { data: configData, error } = await (supabase as any)
        .from('configuracoes')
        .select('*')
        .in('chave', ['comissao_personalizada', 'comissao_padrao']);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Criar objeto de configurações com valores padrão
      const configMap = (configData || []).reduce((acc: any, item: any) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {});
      
      return {
        comissaoPadrao: Number(configMap.comissao_padrao) || 5.0,
        comissaoPersonalizada: Number(configMap.comissao_personalizada) || 5.0
      } as ComissaoConfig;
    },
    enabled: !!user // Só executa se o usuário estiver autenticado
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<ComissaoConfig>) => {
      // Atualizar configurações de comissão
      const updates = [];
      
      if (newConfig.comissaoPadrao !== undefined) {
        updates.push({
          chave: 'comissao_padrao',
          valor: newConfig.comissaoPadrao,
          updated_at: new Date().toISOString()
        });
      }
      
      if (newConfig.comissaoPersonalizada !== undefined) {
        updates.push({
          chave: 'comissao_personalizada',
          valor: newConfig.comissaoPersonalizada,
          updated_at: new Date().toISOString()
        });
      }

      const { data, error } = await (supabase as any)
        .from('configuracoes')
        .upsert(updates, { onConflict: 'chave' })
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comissao-config'] });
      toast({ title: 'Configurações de comissão atualizadas com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar configurações de comissão', variant: 'destructive' });
    }
  });

  return {
    config: config || {
      comissaoPadrao: 5.0,
      comissaoPersonalizada: 5.0
    },
    isLoading,
    updateConfig
  };
}
