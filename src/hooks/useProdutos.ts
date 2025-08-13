import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Produto {
  id: string;
  nome: string;
  descricao?: string | null;
  preco: number;
  estoque: number;
  categoria?: string | null;
  frete?: number | null; // Valor do frete personalizado
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useProdutos() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('produtos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      return data as Produto[];
    },
    enabled: !!user // Só executa se o usuário estiver autenticado
  });

  const createProduto = useMutation({
    mutationFn: async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
      // Corrigir frete: garantir que seja number ou null
      let insertData = { ...produto };
      if (insertData.hasOwnProperty('frete')) {
        if (typeof insertData.frete === 'string') {
          if (insertData.frete === '' || insertData.frete === undefined) {
            insertData.frete = null;
          } else {
            insertData.frete = parseFloat(insertData.frete);
            if (isNaN(insertData.frete)) insertData.frete = null;
          }
        } else if (insertData.frete === undefined || insertData.frete === null) {
          insertData.frete = null;
        }
      }
      
      const { data, error } = await (supabase as any)
        .from('produtos')
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({ title: 'Produto criado com sucesso!' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao criar produto', description: error?.message || 'Erro desconhecido', variant: 'destructive' });
    }
  });

  const updateProduto = useMutation({
    mutationFn: async ({ id, ...produto }: Partial<Produto> & { id: string }) => {
      // Corrigir frete: garantir que seja number ou null
      let updateData = { ...produto };
      if (updateData.hasOwnProperty('frete')) {
        if (typeof updateData.frete === 'string') {
          if (updateData.frete === '' || updateData.frete === undefined) {
            updateData.frete = null;
          } else {
            updateData.frete = parseFloat(updateData.frete);
            if (isNaN(updateData.frete)) updateData.frete = null;
          }
        } else if (updateData.frete === undefined || updateData.frete === null) {
          updateData.frete = null;
        }
      }
      const { data, error } = await (supabase as any)
        .from('produtos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({ title: 'Produto atualizado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar produto', variant: 'destructive' });
    }
  });

  const deleteProduto = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se o produto está sendo usado em alguma venda
      const { data: itensVenda, error: checkError } = await (supabase as any)
        .from('itens_venda')
        .select('id')
        .eq('produto_id', id)
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      if (itensVenda && itensVenda.length > 0) {
        throw new Error('Este produto não pode ser excluído pois está sendo usado em vendas existentes.');
      }
      
      const { error: deleteError } = await (supabase as any)
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({ title: 'Produto deletado com sucesso!' });
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro ao deletar produto';
      toast({ 
        title: 'Erro ao deletar produto', 
        description: errorMessage,
        variant: 'destructive' 
      });
    }
  });

  return {
    produtos,
    isLoading,
    createProduto,
    updateProduto,
    deleteProduto
  };
}