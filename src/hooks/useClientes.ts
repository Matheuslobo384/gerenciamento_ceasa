import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cpf_cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  comissao_personalizada?: number | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function useClientes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('clientes')
        .select('*')
        .order('nome');
      
      if (error) {
        throw error;
      }
      
      return data as Cliente[];
    },
    retry: 3,
    retryDelay: 1000,
  });

  const createCliente = useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await (supabase as any)
        .from('clientes')
        .insert([cliente])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente criado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao criar cliente', variant: 'destructive' });
    }
  });

  const updateCliente = useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('clientes')
        .update(cliente)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente atualizado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao atualizar cliente', variant: 'destructive' });
    }
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast({ title: 'Cliente deletado com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro ao deletar cliente', variant: 'destructive' });
    }
  });

  return {
    clientes,
    isLoading,
    createCliente,
    updateCliente,
    deleteCliente
  };
}