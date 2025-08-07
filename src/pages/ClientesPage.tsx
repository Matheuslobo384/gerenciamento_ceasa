import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { useClientes, Cliente } from '@/hooks/useClientes';
import { ClienteForm } from '@/components/ClienteForm';
import { QuickActions } from '@/components/QuickActions';

function ClientesPage() {
  const { clientes, isLoading, createCliente, updateCliente, deleteCliente } = useClientes();
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [viewingCliente, setViewingCliente] = useState<Cliente | undefined>();

  const handleCreate = (cliente: {
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    comissao_personalizada?: number;
    ativo: boolean;
  }) => {
    createCliente.mutate(cliente, {
      onSuccess: () => {
        setShowForm(false);
      }
    });
  };

  const handleUpdate = (cliente: {
    nome: string;
    email?: string;
    telefone?: string;
    endereco?: string;
    comissao_personalizada?: number;
    ativo: boolean;
  }) => {
    if (editingCliente) {
      updateCliente.mutate(
        { id: editingCliente.id, ...cliente },
        {
          onSuccess: () => {
            setEditingCliente(undefined);
          }
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      deleteCliente.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCliente(undefined);
    setViewingCliente(undefined);
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <ClienteForm
          onSubmit={handleCreate}
          onCancel={handleCancel}
          isLoading={createCliente.isPending}
        />
      </div>
    );
  }

  if (editingCliente) {
    return (
      <div className="container mx-auto py-6">
        <ClienteForm
          cliente={editingCliente}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          isLoading={updateCliente.isPending}
        />
      </div>
    );
  }

  if (viewingCliente) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalhes do Cliente</CardTitle>
            <Button onClick={handleCancel} variant="outline">
              Voltar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <strong>Nome:</strong> {viewingCliente.nome}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge variant={viewingCliente.ativo ? 'default' : 'secondary'}>
                  {viewingCliente.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {viewingCliente.email && (
                <div>
                  <strong>Email:</strong> {viewingCliente.email}
                </div>
              )}
              {viewingCliente.telefone && (
                <div>
                  <strong>Telefone:</strong> {viewingCliente.telefone}
                </div>
              )}
              <div>
                <strong>Data de Cadastro:</strong> {new Date(viewingCliente.created_at).toLocaleDateString('pt-BR')}
              </div>
              <div>
                <strong>Comissão:</strong> {viewingCliente.comissao_personalizada ? `${viewingCliente.comissao_personalizada}%` : 'Padrão do sistema'}
              </div>
            </div>

            {viewingCliente.endereco && (
              <div className="mb-6">
                <strong>Endereço:</strong>
                <p className="mt-1 text-muted-foreground">{viewingCliente.endereco}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clientes</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cliente cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Comissão (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.nome}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{cliente.telefone || '-'}</TableCell>
                    <TableCell>
                      {cliente.comissao_personalizada ? `${cliente.comissao_personalizada}%` : 'Padrão'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={cliente.ativo ? 'default' : 'secondary'}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingCliente(cliente)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCliente(cliente)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(cliente.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ClientesPage;