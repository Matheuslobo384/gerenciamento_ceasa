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

// Interface para inserção de itens (sem subtotal - calculado automaticamente)
export interface ItemVendaInsert {
  venda_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
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
          // Usar interface específica para inserção (sem subtotal)
          const itensParaInserir: ItemVendaInsert[] = itens.map((item: any) => ({
            venda_id: venda.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario
            // subtotal é calculado automaticamente pelo banco de dados
          }));
    
          addLog('info', '📦 Inserindo itens da venda', {
            vendaId: venda.id,
            itens: itensParaInserir
          });
    
          // Inserir SEM enviar subtotal (coluna gerada automaticamente no banco)
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
      
      // Buscar itens existentes da venda
      console.log('useVendas: Buscando itens existentes da venda...');
      const { data: itensExistentes, error: fetchError } = await (supabase as any)
        .from('itens_venda')
        .select('*')
        .eq('venda_id', id);
      
      if (fetchError) {
        console.error('useVendas: Erro ao buscar itens existentes:', fetchError);
        throw fetchError;
      }
      
      console.log('useVendas: Itens existentes encontrados:', itensExistentes?.length || 0);
      
      // Processar itens para atualização inteligente
      const itensParaProcessar = itens || [];
      const itensExistentesMap = new Map(
        itensExistentes?.map(item => [item.produto_id, item]) || []
      );
      
      const itensParaAtualizar: any[] = [];
      const itensParaInserir: ItemVendaInsert[] = [];
      const itensParaRemover: string[] = [];
      
      // Identificar itens que precisam ser atualizados, inseridos ou removidos
      itensParaProcessar.forEach(novoItem => {
        const itemExistente = itensExistentesMap.get(novoItem.produto_id);
        
        if (itemExistente) {
          // Item existe - verificar se precisa atualizar
          if (itemExistente.quantidade !== novoItem.quantidade || 
              itemExistente.preco_unitario !== novoItem.preco_unitario) {
            itensParaAtualizar.push({
              id: itemExistente.id,
              quantidade: novoItem.quantidade,
              preco_unitario: novoItem.preco_unitario
            });
          }
          // Marcar como processado
          itensExistentesMap.delete(novoItem.produto_id);
        } else {
          // Item novo - inserir
          itensParaInserir.push({
            venda_id: id,
            produto_id: novoItem.produto_id,
            quantidade: novoItem.quantidade,
            preco_unitario: novoItem.preco_unitario
          });
        }
      });
      
      // Itens que não estão mais na lista - remover
      itensExistentesMap.forEach(item => {
        itensParaRemover.push(item.id);
      });
      
      console.log('useVendas: Operações necessárias:', {
        atualizar: itensParaAtualizar.length,
        inserir: itensParaInserir.length,
        remover: itensParaRemover.length
      });
      
      // Executar operações de forma otimizada
      
      // 1. Remover itens que não existem mais
      if (itensParaRemover.length > 0) {
        console.log('useVendas: Removendo itens não mais necessários...');
        const { error: deleteError } = await (supabase as any)
          .from('itens_venda')
          .delete()
          .in('id', itensParaRemover);
        
        if (deleteError) {
          console.error('useVendas: Erro ao remover itens:', deleteError);
          throw deleteError;
        }
        console.log('useVendas: Itens removidos:', itensParaRemover.length);
      }
      
      // 2. Atualizar itens existentes que mudaram
      if (itensParaAtualizar.length > 0) {
        console.log('useVendas: Atualizando itens existentes...');
        for (const item of itensParaAtualizar) {
          const { error: updateError } = await (supabase as any)
            .from('itens_venda')
            .update({
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario
            })
            .eq('id', item.id);
          
          if (updateError) {
            console.error('useVendas: Erro ao atualizar item:', updateError);
            throw updateError;
          }
        }
        console.log('useVendas: Itens atualizados:', itensParaAtualizar.length);
      }
      
      // 3. Inserir novos itens
      if (itensParaInserir.length > 0) {
        console.log('useVendas: Inserindo novos itens...');
        const { error: insertError } = await (supabase as any)
          .from('itens_venda')
          .insert(itensParaInserir);
        
        if (insertError) {
          console.error('useVendas: Erro ao inserir novos itens:', insertError);
          throw insertError;
        }
        console.log('useVendas: Novos itens inseridos:', itensParaInserir.length);
      }
      
      console.log('useVendas: Venda e itens atualizados com sucesso (preservando itens existentes)');
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

  // Função para verificar e corrigir frete nas vendas
  const verificarFreteVendas = useMutation({
    mutationFn: async () => {
      console.log('🔍 useVendas: Iniciando verificação de frete nas vendas...');
      
      try {
        // Buscar todas as vendas com itens
        const { data: vendasComItens, error: fetchError } = await (supabase as any)
          .from('vendas')
          .select(`
            *,
            itens_venda (
              *,
              produtos:produto_id (*)
            )
          `);
        
        if (fetchError) {
          console.error('❌ useVendas: Erro ao buscar vendas:', fetchError);
          throw fetchError;
        }
        
        console.log(`📊 useVendas: Encontradas ${vendasComItens?.length || 0} vendas para verificação`);
        
        let vendasCorrigidas = 0;
        
        // Verificar cada venda
        for (const venda of vendasComItens || []) {
          if (venda.itens_venda && venda.itens_venda.length > 0) {
            // Calcular frete correto baseado nos itens
            const itensComProdutos = venda.itens_venda.map((item: any) => ({
              produto_id: item.produto_id,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              produto: item.produtos
            }));
            
            // Importar função de cálculo de frete
            const { calcularFrete } = await import('@/lib/frete');
            
            // Buscar configuração de frete atual
            const { data: configData } = await (supabase as any)
              .from('configuracoes')
              .select('*')
              .in('chave', ['frete_fixo', 'tipo_calculo_frete', 'frete_por_quantidade']);
            
            const configMap = (configData || []).reduce((acc: any, item: any) => {
              acc[item.chave] = item.valor;
              return acc;
            }, {});
            
            const freteConfig = {
              fretePadrao: Number(configMap.frete_fixo) || 15,
              tipoCalculo: configMap.tipo_calculo_frete || 'por_pedido',
              fretePorQuantidade: Number(configMap.frete_por_quantidade) || 5
            };
            
            const subtotal = itensComProdutos.reduce((acc: any, item: any) => 
              acc + (item.quantidade * item.preco_unitario), 0
            );
            
            const calculoFrete = calcularFrete(itensComProdutos, freteConfig, subtotal);
            
            // Verificar se o frete precisa ser corrigido
            if (Math.abs((venda as any).frete - calculoFrete.valorFrete) > 0.01) {
              console.log(`🔄 useVendas: Corrigindo frete da venda ${(venda as any).id}: ${(venda as any).frete} → ${calculoFrete.valorFrete}`);
              
              const { error: updateError } = await (supabase as any)
                .from('vendas')
                .update({
                  frete: calculoFrete.valorFrete,
                  tipo_frete: calculoFrete.tipoFrete
                })
                .eq('id', (venda as any).id);
              
              if (updateError) {
                console.error(`❌ useVendas: Erro ao corrigir frete da venda ${(venda as any).id}:`, updateError);
              } else {
                vendasCorrigidas++;
              }
            }
          }
        }
        
        console.log(`✅ useVendas: Verificação concluída. ${vendasCorrigidas} vendas corrigidas`);
        return { vendasVerificadas: vendasComItens?.length || 0, vendasCorrigidas };
        
      } catch (error) {
        console.error('💥 useVendas: Erro durante verificação de frete:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      console.log('🔄 useVendas: Invalidando cache de vendas após verificação');
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
      toast({ 
        title: 'Verificação de frete concluída!', 
        description: `${result.vendasCorrigidas} vendas corrigidas de ${result.vendasVerificadas} verificadas` 
      });
    },
    onError: (error: any) => {
      console.error('🚨 useVendas: Erro na verificação de frete:', error);
      toast({ 
        title: 'Erro na verificação de frete', 
        description: error?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
  });

  return {
    vendas,
    isLoading,
    createVenda,
    updateVenda,
    deleteVenda,
    verificarFreteVendas
  };
}