import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Venda {
  id: string;
  cliente_id?: string | null;
  total: number;
  desconto?: number | null;
  frete?: number | null;
  tipo_frete?: string | null;
  comissao_percentual?: number | null;
  comissao_valor?: number | null;
  status: string;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemVenda {
  id: string;
  venda_id?: string | null;
  produto_id?: string | null;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  created_at: string;
}

export interface VendaCompleta extends Venda {
  clientes?: { 
    nome: string;
    cpf_cnpj?: string;
    telefone?: string;
    endereco?: string;
  };
  itens_venda: (ItemVenda & {
    produtos: { nome: string };
  })[];
}

export function useVendas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      console.log('useVendas: Buscando vendas...');
      const { data, error } = await (supabase as any)
        .from('vendas')
        .select(`
          *,
          clientes(nome, cpf_cnpj, telefone, endereco),
          itens_venda(*, produtos(nome))
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('useVendas: Erro ao buscar vendas:', error);
        throw error;
      }
      
      console.log('useVendas: Vendas carregadas:', data);
      return data as VendaCompleta[];
    }
  });

  const createVenda = useMutation({
    mutationFn: async (venda: { 
      cliente_id?: string; 
      total: number; 
      desconto?: number; 
      frete?: number;
      tipoFrete?: string;
      status: string; 
      observacoes?: string;
      comissao_percentual?: number;
      itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    }) => {
      console.log('useVendas: Iniciando criação de venda:', venda);
      const { itens, tipoFrete, frete, ...vendaData } = venda;
      
      // Preparar dados da venda incluindo frete e comissão
      const vendaParaEnviar = {
        ...vendaData,
        frete: frete || null,
        tipo_frete: tipoFrete || 'padrao'
      };
      
      console.log('useVendas: Criando venda no banco...');
      const { data: vendaCriada, error: vendaError } = await (supabase as any)
        .from('vendas')
        .insert([vendaParaEnviar])
        .select()
        .single();
      
      if (vendaError) {
        console.error('useVendas: Erro ao criar venda:', vendaError);
        throw vendaError;
      }
      if (!vendaCriada) {
        console.error('useVendas: Venda não foi criada');
        throw new Error('Erro ao criar venda');
      }

      console.log('useVendas: Venda criada com sucesso:', vendaCriada);

      const itensComSubtotal = itens.map(item => ({
        venda_id: vendaCriada.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.quantidade * item.preco_unitario
      }));

      console.log('useVendas: Criando itens da venda:', itensComSubtotal);

      const { error: itensError } = await (supabase as any)
        .from('itens_venda')
        .insert(itensComSubtotal);
      
      if (itensError) {
        console.error('useVendas: Erro ao criar itens da venda:', itensError);
        throw itensError;
      }
      
      console.log('useVendas: Venda e itens criados com sucesso');
      return vendaCriada;
    },
    onSuccess: () => {
      console.log('useVendas: Invalidando cache de vendas');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({ title: 'Venda criada com sucesso!' });
    },
    onError: (error) => {
      console.error('useVendas: Erro na mutação de criação:', error);
      toast({ title: 'Erro ao criar venda', variant: 'destructive' });
    }
  });

  const updateVenda = useMutation({
    mutationFn: async (venda: { 
      id: string;
      cliente_id?: string; 
      total: number; 
      desconto?: number; 
      frete?: number;
      tipoFrete?: string;
      status: string; 
      observacoes?: string;
      comissao_percentual?: number;
      itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    }) => {
      console.log('useVendas: Iniciando atualização de venda:', venda);
      const { id, itens, tipoFrete, frete, ...vendaData } = venda;
      
      // Preparar dados da venda incluindo frete e comissão
      const vendaParaEnviar = {
        ...vendaData,
        frete: frete || null,
        tipo_frete: tipoFrete || 'padrao'
      };
      
      console.log('useVendas: Atualizando venda no banco...');
      const { data: vendaAtualizada, error: vendaError } = await (supabase as any)
        .from('vendas')
        .update(vendaParaEnviar)
        .eq('id', id)
        .select()
        .single();
      
      if (vendaError) {
        console.error('useVendas: Erro ao atualizar venda:', vendaError);
        throw vendaError;
      }
      
      // Remover itens antigos
      console.log('useVendas: Removendo itens antigos da venda...');
      const { error: deleteError } = await (supabase as any)
        .from('itens_venda')
        .delete()
        .eq('venda_id', id);
      
      if (deleteError) {
        console.error('useVendas: Erro ao remover itens antigos:', deleteError);
        throw deleteError;
      }
      
      // Criar novos itens
      const itensComSubtotal = itens.map(item => ({
        venda_id: id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        subtotal: item.quantidade * item.preco_unitario
      }));

      console.log('useVendas: Criando novos itens da venda:', itensComSubtotal);

      const { error: itensError } = await (supabase as any)
        .from('itens_venda')
        .insert(itensComSubtotal);
      
      if (itensError) {
        console.error('useVendas: Erro ao criar novos itens da venda:', itensError);
        throw itensError;
      }
      
      console.log('useVendas: Venda e itens atualizados com sucesso');
      return vendaAtualizada;
    },
    onSuccess: () => {
      console.log('useVendas: Invalidando cache de vendas após atualização');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({ title: 'Venda atualizada com sucesso!' });
    },
    onError: (error) => {
      console.error('useVendas: Erro na mutação de atualização:', error);
      toast({ title: 'Erro ao atualizar venda', variant: 'destructive' });
    }
  });

  const deleteVenda = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ useVendas: Iniciando exclusão de venda:', id);
      
      try {
        // Verificar se a venda existe
        console.log('🔍 useVendas: Verificando se a venda existe...');
        const { data: vendaExistente, error: checkError } = await (supabase as any)
          .from('vendas')
          .select('id')
          .eq('id', id)
          .single();
        
        if (checkError) {
          console.error('❌ useVendas: Erro ao verificar venda:', checkError);
          throw new Error(`Erro ao verificar venda: ${checkError.message}`);
        }
        
        if (!vendaExistente) {
          console.error('❌ useVendas: Venda não encontrada:', id);
          throw new Error('Venda não encontrada');
        }
        
        console.log('✅ useVendas: Venda encontrada, prosseguindo com exclusão...');
        
        // Primeiro, deletar os itens da venda
        console.log('📦 useVendas: Deletando itens da venda...');
        const { data: itensData, error: itensError } = await (supabase as any)
          .from('itens_venda')
          .delete()
          .eq('venda_id', id)
          .select();
        
        if (itensError) {
          console.error('❌ useVendas: Erro ao deletar itens da venda:', itensError);
          throw new Error(`Erro ao deletar itens: ${itensError.message}`);
        }
        
        console.log('✅ useVendas: Itens deletados:', itensData?.length || 0, 'itens');
        
        // Depois, deletar a venda
        console.log('🏷️ useVendas: Deletando venda principal...');
        const { data: vendaData, error: vendaError } = await (supabase as any)
          .from('vendas')
          .delete()
          .eq('id', id)
          .select();
        
        if (vendaError) {
          console.error('❌ useVendas: Erro ao deletar venda:', vendaError);
          throw new Error(`Erro ao deletar venda: ${vendaError.message}`);
        }
        
        if (!vendaData || vendaData.length === 0) {
          console.error('❌ useVendas: Nenhuma venda foi deletada');
          throw new Error('Nenhuma venda foi deletada - possível problema de permissão');
        }
        
        console.log('🎉 useVendas: Venda deletada com sucesso:', vendaData);
        return { success: true, deletedItems: itensData?.length || 0 };
        
      } catch (error) {
        console.error('💥 useVendas: Erro durante exclusão:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('🔄 useVendas: Invalidando cache de vendas após exclusão');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({ 
        title: 'Venda deletada com sucesso!', 
        description: `${result.deletedItems} itens removidos` 
      });
    },
    onError: (error: any) => {
      console.error('🚨 useVendas: Erro na mutação de exclusão:', error);
      const errorMessage = error?.message || 'Erro desconhecido ao deletar venda';
      toast({ 
        title: 'Erro ao deletar venda', 
        description: errorMessage,
        variant: 'destructive' 
      });
    }
  });

  return {
    vendas,
    isLoading,
    createVenda,
    updateVenda,
    deleteVenda
  };
}