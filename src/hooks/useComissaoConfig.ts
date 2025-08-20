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
      
      // Criar objeto de configurações com valores padrão apenas se não existirem
      const configMap = (configData || []).reduce((acc: any, item: any) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {});
      
      return {
        comissaoPadrao: configMap.comissao_padrao !== null && configMap.comissao_padrao !== undefined ? Number(configMap.comissao_padrao) : 5.0,
        comissaoPersonalizada: configMap.comissao_personalizada !== null && configMap.comissao_personalizada !== undefined ? Number(configMap.comissao_personalizada) : 5.0
      } as ComissaoConfig;
    },
    enabled: !!user, // Só executa se o usuário estiver autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos - evita refetch desnecessário
    cacheTime: 10 * 60 * 1000 // 10 minutos - mantém cache por mais tempo
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<ComissaoConfig>) => {
      // Atualizar configurações de comissão - FORMATO CORRIGIDO
      const updates = [];
      
      if (newConfig.comissaoPadrao !== undefined) {
        updates.push({
          chave: 'comissao_padrao',
          valor: newConfig.comissaoPadrao, // Valor primitivo direto
          updated_at: new Date().toISOString()
        });
      }
      
      if (newConfig.comissaoPersonalizada !== undefined) {
        updates.push({
          chave: 'comissao_personalizada',
          valor: newConfig.comissaoPersonalizada, // Valor primitivo direto
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
