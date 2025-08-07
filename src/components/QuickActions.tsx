import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Users, DollarSign, Plus, X } from 'lucide-react';
import { ProdutoForm } from './ProdutoForm';
import { ClienteForm } from './ClienteForm';
import { VendaForm } from './VendaForm';
import { useProdutos } from '@/hooks/useProdutos';
import { useClientes } from '@/hooks/useClientes';
import { useVendas } from '@/hooks/useVendas';
import { useToast } from '@/hooks/use-toast';

interface QuickActionsProps {
  variant?: 'card' | 'buttons';
  className?: string;
}

export function QuickActions({ variant = 'card', className }: QuickActionsProps) {
  const { toast } = useToast();
  const { createProduto } = useProdutos();
  const { createCliente } = useClientes();
  const { createVenda } = useVendas();

  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showVendaModal, setShowVendaModal] = useState(false);

  const handleCreateProduto = (produto: {
    nome: string;
    descricao?: string;
    preco: number;
    estoque: number;
    categoria?: string;
    frete?: number;
    ativo: boolean;
  }) => {
    createProduto.mutate(produto, {
      onSuccess: () => {
        setShowProdutoModal(false);
        toast({ title: 'Produto cadastrado com sucesso!' });
      },
      onError: () => {
        toast({ title: 'Erro ao cadastrar produto', variant: 'destructive' });
      }
    });
  };

  const handleCreateCliente = (cliente: {
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    ativo: boolean;
  }) => {
    createCliente.mutate(cliente, {
      onSuccess: () => {
        setShowClienteModal(false);
        toast({ title: 'Cliente cadastrado com sucesso!' });
      },
      onError: () => {
        toast({ title: 'Erro ao cadastrar cliente', variant: 'destructive' });
      }
    });
  };

  const handleCreateVenda = (venda: {
    cliente_id?: string;
    total: number;
    desconto?: number;
    status: string;
    observacoes?: string;
    itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    frete?: number;
    tipoFrete?: string;
    comissao_percentual?: number;
  }) => {
    createVenda.mutate(venda, {
      onSuccess: () => {
        setShowVendaModal(false);
        toast({ title: 'Venda registrada com sucesso!' });
      },
      onError: () => {
        toast({ title: 'Erro ao registrar venda', variant: 'destructive' });
      }
    });
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto para cadastrá-lo no sistema.
              </DialogDescription>
            </DialogHeader>
            <ProdutoForm
              onSubmit={handleCreateProduto}
              onCancel={() => setShowProdutoModal(false)}
              isLoading={createProduto.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para cadastrá-lo no sistema.
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              onSubmit={handleCreateCliente}
              onCancel={() => setShowClienteModal(false)}
              isLoading={createCliente.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showVendaModal} onOpenChange={setShowVendaModal}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Nova Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
              <DialogDescription>
                Preencha os dados da venda para registrá-la no sistema.
              </DialogDescription>
            </DialogHeader>
            <VendaForm
              onSubmit={handleCreateVenda}
              onCancel={() => setShowVendaModal(false)}
              isLoading={createVenda.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>Acesse rapidamente as funcionalidades principais</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Dialog open={showProdutoModal} onOpenChange={setShowProdutoModal}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Package className="mr-2 h-4 w-4" />
              Cadastrar Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados do produto para cadastrá-lo no sistema.
              </DialogDescription>
            </DialogHeader>
            <ProdutoForm
              onSubmit={handleCreateProduto}
              onCancel={() => setShowProdutoModal(false)}
              isLoading={createProduto.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showClienteModal} onOpenChange={setShowClienteModal}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para cadastrá-lo no sistema.
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              onSubmit={handleCreateCliente}
              onCancel={() => setShowClienteModal(false)}
              isLoading={createCliente.isPending}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showVendaModal} onOpenChange={setShowVendaModal}>
          <DialogTrigger asChild>
            <Button className="w-full justify-start" variant="outline">
              <DollarSign className="mr-2 h-4 w-4" />
              Registrar Venda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
              <DialogDescription>
                Preencha os dados da venda para registrá-la no sistema.
              </DialogDescription>
            </DialogHeader>
            <VendaForm
              onSubmit={handleCreateVenda}
              onCancel={() => setShowVendaModal(false)}
              isLoading={createVenda.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}