import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FreteConfig } from '@/components/FreteConfig';

export function useFreteConfig() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      
      // Criar objeto de configurações com valores padrão
      const configMap = (configData || []).reduce((acc: any, item: any) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {});
      
      return {
        fretePadrao: Number(configMap.frete_fixo) || 15,
        tipoCalculo: configMap.tipo_calculo_frete || 'por_pedido',
        fretePorQuantidade: Number(configMap.frete_por_quantidade) || 5
      } as FreteConfig;
    }
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: FreteConfig) => {
      // Atualizar configurações de frete
      const updates = [
        {
          chave: 'frete_fixo',
          valor: newConfig.fretePadrao,
          updated_at: new Date().toISOString()
        },
        {
          chave: 'tipo_calculo_frete',
          valor: newConfig.tipoCalculo,
          updated_at: new Date().toISOString()
        }
      ];

      if (newConfig.fretePorQuantidade !== undefined) {
        updates.push({
          chave: 'frete_por_quantidade',
          valor: newConfig.fretePorQuantidade,
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
      fretePadrao: 15,
      tipoCalculo: 'por_pedido' as const,
      fretePorQuantidade: 5
    },
    isLoading,
    updateConfig
  };
}