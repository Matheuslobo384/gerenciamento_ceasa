import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Edit2, Trash2, Plus, Eye, Search, Filter } from 'lucide-react';
import { useProdutos, Produto } from '@/hooks/useProdutos';
import { ProdutoForm } from '@/components/ProdutoForm';
import { ProdutoInlineEdit } from '@/components/ProdutoInlineEdit';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { QuickActions } from '@/components/QuickActions';
import { useToast } from '@/hooks/use-toast';

function ProdutosPage() {
  const { produtos, isLoading, createProduto, updateProduto, deleteProduto } = useProdutos();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();
  const [viewingProduto, setViewingProduto] = useState<Produto | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');
  const [categoriaFilter, setCategoriaFilter] = useState('all');
  const [enableInlineEdit, setEnableInlineEdit] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; produtoId: string | null }>({
    open: false,
    produtoId: null
  });

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (produto.descricao && produto.descricao.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (produto.categoria && produto.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'ativo' && produto.ativo) ||
                         (statusFilter === 'inativo' && !produto.ativo);
    
    const matchesCategoria = categoriaFilter === 'all' || produto.categoria === categoriaFilter;
    
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  // Obter categorias únicas
  const categorias = [...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  const handleCreate = (produto: {
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
        setShowForm(false);
      }
    });
  };

  const handleUpdate = (produto: {
    nome: string;
    descricao?: string;
    preco: number;
    estoque: number;
    categoria?: string;
    frete?: number;
    ativo: boolean;
  }) => {
    if (editingProduto) {
      updateProduto.mutate({
        id: editingProduto.id,
        ...produto
      }, {
        onSuccess: () => {
          setEditingProduto(undefined);
        }
      });
    }
  };

  const handleInlineUpdate = (id: string, field: keyof Produto, value: any) => {
    updateProduto.mutate({
      id,
      [field]: value
    }, {
      onSuccess: () => {
        toast({ title: 'Produto atualizado com sucesso!' });
      },
      onError: () => {
        toast({ title: 'Erro ao atualizar produto', variant: 'destructive' });
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ open: true, produtoId: id });
  };

  const confirmDelete = () => {
    if (deleteConfirm.produtoId) {
      deleteProduto.mutate(deleteConfirm.produtoId);
      setDeleteConfirm({ open: false, produtoId: null });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduto(undefined);
    setViewingProduto(undefined);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoriaFilter('all');
  };

  if (showForm) {
    return (
      <div className="container mx-auto py-6">
        <ErrorBoundary>
          <ProdutoForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
            isLoading={createProduto.isPending}
          />
        </ErrorBoundary>
      </div>
    );
  }

  if (editingProduto) {
    return (
      <div className="container mx-auto py-6">
        <ErrorBoundary>
          <ProdutoForm
            produto={editingProduto}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
            isLoading={updateProduto.isPending}
          />
        </ErrorBoundary>
      </div>
    );
  }

  if (viewingProduto) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Detalhes do Produto</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setViewingProduto(undefined);
                  setEditingProduto(viewingProduto);
                }} 
                variant="outline"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <strong>Nome:</strong> {viewingProduto.nome}
              </div>
              <div>
                <strong>Status:</strong>{' '}
                <Badge variant={viewingProduto.ativo ? 'default' : 'secondary'}>
                  {viewingProduto.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div>
                <strong>Preço:</strong> R$ {viewingProduto.preco.toFixed(2)}
              </div>
              <div>
                <strong>Frete:</strong> {viewingProduto.frete ? `R$ ${viewingProduto.frete.toFixed(2)}` : 'Não definido'}
              </div>
              <div>
                <strong>Estoque:</strong> {viewingProduto.estoque} unidades
              </div>
              {viewingProduto.categoria && (
                <div>
                  <strong>Categoria:</strong> {viewingProduto.categoria}
                </div>
              )}
              <div>
                <strong>Data de Cadastro:</strong> {new Date(viewingProduto.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>

            {viewingProduto.descricao && (
              <div className="mb-6">
                <strong>Descrição:</strong>
                <p className="mt-1 text-muted-foreground">{viewingProduto.descricao}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Produtos</h2>
            <p className="text-muted-foreground">
              {filteredProdutos.length} de {produtos.length} produtos
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, descrição ou categoria..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={(value: 'all' | 'ativo' | 'inativo') => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="ativo">Ativos</SelectItem>
                    <SelectItem value="inativo">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Limpar Filtros
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="inlineEdit"
                checked={enableInlineEdit}
                onCheckedChange={setEnableInlineEdit}
              />
              <Label htmlFor="inlineEdit">Ativar edição rápida na tabela</Label>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum produto cadastrado
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum produto encontrado com os filtros aplicados
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Frete</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProdutos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">
                        {enableInlineEdit ? (
                          <ProdutoInlineEdit
                            produto={produto}
                            field="nome"
                            onSave={handleInlineUpdate}
                            isLoading={updateProduto.isPending}
                          />
                        ) : (
                          produto.nome
                        )}
                      </TableCell>
                      <TableCell>
                        {enableInlineEdit ? (
                          <ProdutoInlineEdit
                            produto={produto}
                            field="preco"
                            onSave={handleInlineUpdate}
                            isLoading={updateProduto.isPending}
                          />
                        ) : (
                          `R$ ${produto.preco.toFixed(2)}`
                        )}
                      </TableCell>
                      <TableCell>
                        {enableInlineEdit ? (
                          <ProdutoInlineEdit
                            produto={produto}
                            field="frete"
                            onSave={handleInlineUpdate}
                            isLoading={updateProduto.isPending}
                          />
                        ) : (
                          produto.frete ? `R$ ${produto.frete.toFixed(2)}` : '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {enableInlineEdit ? (
                          <ProdutoInlineEdit
                            produto={produto}
                            field="estoque"
                            onSave={handleInlineUpdate}
                            isLoading={updateProduto.isPending}
                          />
                        ) : (
                          <span className={produto.estoque < 20 ? 'text-warning font-medium' : ''}>
                            {produto.estoque} unidades
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {enableInlineEdit ? (
                          <ProdutoInlineEdit
                            produto={produto}
                            field="categoria"
                            onSave={handleInlineUpdate}
                            isLoading={updateProduto.isPending}
                          />
                        ) : (
                          produto.categoria || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={produto.ativo ? 'default' : 'secondary'}>
                          {produto.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewingProduto(produto)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingProduto(produto)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(produto.id)}
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, produtoId: deleteConfirm.produtoId })}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir o produto "${deleteConfirm.produtoId ? produtos.find(p => p.id === deleteConfirm.produtoId)?.nome : ''}"? Esta ação não pode ser desfeita.`}
        onConfirm={confirmDelete}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}

export default ProdutosPage;