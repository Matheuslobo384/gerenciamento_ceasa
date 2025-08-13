import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDebug } from '@/hooks/useDebug';
import { useAuth } from '@/hooks/useAuth';

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
  const { addLog } = useDebug();
  const { user } = useAuth();

  const { data: vendas = [], isLoading } = useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      addLog('info', 'Buscando vendas...');
      
      const { data, error } = await (supabase as any)
        .from('vendas')
        .select(`
          *,
          clientes:cliente_id (nome, cpf_cnpj, telefone, endereco),
          itens_venda (
            *,
            produtos:produto_id (nome)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        addLog('error', 'Erro ao buscar vendas', error);
        throw error;
      }
      
      addLog('info', `${data?.length || 0} vendas carregadas`);
      return data as VendaCompleta[];
    },
    enabled: !!user // Só executa se o usuário estiver autenticado
  });

  const createVenda = useMutation({
    mutationFn: async (vendaData: any) => {
      addLog('info', '🚀 Iniciando criação de venda', vendaData);
      
      try {
        // Preparar dados da venda
        const { itens, ...vendaSemItens } = vendaData;
        
        // Limpar campos que podem causar conflito
        const vendaLimpa = {
          cliente_id: vendaSemItens.cliente_id || null,
          total: vendaSemItens.total,
          desconto: vendaSemItens.desconto || null,
          frete: vendaSemItens.frete || null,
          tipo_frete: vendaSemItens.tipo_frete || null,
          status: vendaSemItens.status,
          observacoes: vendaSemItens.observacoes || null,
          comissao_percentual: vendaSemItens.comissao_percentual || null
        };
        
        addLog('info', '📝 Dados da venda preparados', {
          venda: vendaLimpa,
          quantidadeItens: itens?.length || 0
        });
    
        // Inserir venda - usar (supabase as any) para evitar erro de tipagem
        const { data: venda, error: vendaError } = await (supabase as any)
          .from('vendas')
          .insert([vendaLimpa])
          .select()
          .single();
    
        if (vendaError) {
          addLog('error', '❌ Erro ao inserir venda', {
            error: vendaError,
            dadosEnviados: vendaLimpa
          });
          throw vendaError;
        }

        // Verificar se venda foi criada com sucesso
        if (!venda) {
          throw new Error('Venda não foi criada - dados retornados são null');
        }
    
        addLog('info', '✅ Venda criada com sucesso', { vendaId: venda.id });
    
        // Inserir itens se existirem
        if (itens && itens.length > 0) {
          const itensParaInserir = itens.map((item: any) => ({
            venda_id: venda.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
          }));
    
          addLog('info', '📦 Inserindo itens da venda', {
            vendaId: venda.id,
            itens: itensParaInserir
          });
    
          // Inserir SEM enviar subtotal (coluna gerada no banco)
          const { error: itensError } = await (supabase as any)
            .from('itens_venda')
            .insert(itensParaInserir);
    
          if (itensError) {
            addLog('error', '❌ Erro ao inserir itens', {
              error: itensError,
              itensEnviados: itensParaInserir
            });
            throw itensError;
          } else {
            addLog('info', '✅ Itens inseridos com sucesso');
          }
        }
    
        addLog('info', '🎉 Venda completa criada com sucesso', { vendaId: venda.id });
        return venda;
        
      } catch (error) {
        addLog('error', '💥 Erro geral na criação de venda', {
          error,
          dadosOriginais: vendaData
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({
        title: "✅ Sucesso",
        description: "Venda criada com sucesso!",
      });
    },
    onError: (error: any) => {
      addLog('error', '🚨 Falha na criação de venda', error);
      toast({
        title: "❌ Erro",
        description: `Erro ao criar venda: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateVenda = useMutation({
    mutationFn: async (venda: { 
      id: string;
      cliente_id?: string; 
      total: number; 
      desconto?: number; 
      frete?: number;
      tipo_frete?: string;
      status: string; 
      observacoes?: string;
      comissao_percentual?: number;
      itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    }) => {
      console.log('useVendas: Iniciando atualização de venda:', venda);
      const { id, itens, tipo_frete, frete, ...vendaData } = venda;
      
      // Preparar dados da venda incluindo frete e tipo_frete
      const vendaParaEnviar = {
        ...vendaData,
        frete: frete || null,
        tipo_frete: tipo_frete || 'padrao'
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

      console.log('useVendas: Criando novos itens da venda (com subtotal):', itensComSubtotal);

      const { error: itensInsertError1 } = await (supabase as any)
        .from('itens_venda')
        .insert(itensComSubtotal);

      // Fallback para ausência da coluna subtotal
      if (itensInsertError1 && /column .*subtotal.* does not exist/i.test(itensInsertError1.message || '')) {
        console.warn('useVendas: Coluna subtotal não existe em itens_venda. Tentando inserir sem subtotal...');
        const itensSemSubtotal = itens.map(item => ({
          venda_id: id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }));
        const { error: itensInsertError2 } = await (supabase as any)
          .from('itens_venda')
          .insert(itensSemSubtotal);

        if (itensInsertError2) {
          console.error('useVendas: Erro ao criar itens (fallback sem subtotal):', itensInsertError2);
          throw itensInsertError2;
        }
      } else if (itensInsertError1) {
        console.error('useVendas: Erro ao criar novos itens da venda:', itensInsertError1);
        throw itensInsertError1;
      }
      
      console.log('useVendas: Criando novos itens da venda (sem subtotal):', itensParaInserir);

      const { error: itensInsertError } = await (supabase as any)
        .from('itens_venda')
        .insert(itensParaInserir);

      if (itensInsertError) {
        console.error('useVendas: Erro ao criar novos itens da venda:', itensInsertError);
        throw itensInsertError;
      }
      
      console.log('useVendas: Venda e itens atualizados com sucesso');
      return vendaAtualizada;
    },
    onSuccess: () => {
      console.log('useVendas: Invalidando cache de vendas após atualização');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({ title: 'Venda atualizada com sucesso!' });
    },
    onError: (error: any) => {
      console.error('useVendas: Erro na mutação de atualização:', error);
      toast({ title: 'Erro ao atualizar venda', description: error?.message || String(error), variant: 'destructive' });
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