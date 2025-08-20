import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FreteConfig } from '@/components/FreteConfig';
import { useAuth } from '@/hooks/useAuth';

export function useFreteConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: config, isLoading } = useQuery({
    queryKey: ['frete-config'],
    queryFn: async () => {
      // Buscar todas as configurações de frete
      const { data: configData, error } = await (supabase as any)
        .from('configuracoes')
        .select('*')
        .in('chave', ['frete_fixo', 'tipo_calculo_frete', 'frete_por_quantidade']);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Criar objeto de configurações com valores padrão apenas se não existirem
      const configMap = (configData || []).reduce((acc: any, item: any) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {});
      
      return {
        fretePadrao: configMap.frete_fixo !== null && configMap.frete_fixo !== undefined ? Number(configMap.frete_fixo) : 0,
        tipoCalculo: configMap.tipo_calculo_frete || 'por_pedido',
        fretePorQuantidade: configMap.frete_por_quantidade !== null && configMap.frete_por_quantidade !== undefined ? Number(configMap.frete_por_quantidade) : 0
      } as FreteConfig;
    },
    enabled: !!user, // Só executa se o usuário estiver autenticado
    staleTime: 5 * 60 * 1000, // 5 minutos - evita refetch desnecessário
    cacheTime: 10 * 60 * 1000 // 10 minutos - mantém cache por mais tempo
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: FreteConfig) => {
      // Atualizar configurações de frete - FORMATO CORRIGIDO
      const updates = [
        {
          chave: 'frete_fixo',
          valor: newConfig.fretePadrao, // Valor primitivo direto
          updated_at: new Date().toISOString()
        },
        {
          chave: 'tipo_calculo_frete',
          valor: newConfig.tipoCalculo, // Valor primitivo direto
          updated_at: new Date().toISOString()
        }
      ];
  
      if (newConfig.fretePorQuantidade !== undefined) {
        updates.push({
          chave: 'frete_por_quantidade',
          valor: newConfig.fretePorQuantidade, // Valor primitivo direto
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
      queryClient.invalidateQueries({ queryKey: ['frete-config'] });
      toast({ title: 'Configurações de frete atualizadas com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar configurações de frete', variant: 'destructive' });
    }
  });

  return {
    config: config || {
      fretePadrao: 0,
      tipoCalculo: 'por_pedido' as const,
      fretePorQuantidade: 0
    },
    isLoading,
    updateConfig
  };
}