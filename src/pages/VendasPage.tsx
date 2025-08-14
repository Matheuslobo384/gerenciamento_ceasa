import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Trash2, Plus, Eye, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipagem para usar autoTable com jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}
import { useVendas, VendaCompleta } from '@/hooks/useVendas';
import { VendaForm } from '@/components/VendaForm';
import { QuickActions } from '@/components/QuickActions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useFreteConfig } from '@/hooks/useFreteConfig';

function VendasPage() {
  const { vendas, createVenda, updateVenda, deleteVenda, isLoading } = useVendas();
  const { config: freteConfig } = useFreteConfig();
  const [viewingVenda, setViewingVenda] = useState<VendaCompleta | null>(null);
  const [showVendaForm, setShowVendaForm] = useState(false);
  const [editingVenda, setEditingVenda] = useState<VendaCompleta | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; vendaId: string | null }>({ open: false, vendaId: null });
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleDelete = (id: string) => {
    if (!isMountedRef.current) return;
    if (confirm('Tem certeza que deseja deletar esta venda?')) {
      deleteVenda.mutate(id);
    }
  };

  const handleCreateVenda = (venda: {
    cliente_id?: string;
    total: number;
    desconto?: number;
    status: string;
    observacoes?: string;
    itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    frete?: number;
    tipo_frete?: string;
    comissao_percentual?: number;
  }) => {
    if (!isMountedRef.current) return;
    createVenda.mutate(venda, {
      onSuccess: () => {
        setShowVendaForm(false);
      }
    });
  };

  const handleUpdateVenda = (venda: {
    cliente_id?: string;
    total: number;
    desconto?: number;
    status: string;
    observacoes?: string;
    itens: { produto_id: string; quantidade: number; preco_unitario: number }[];
    frete?: number;
    tipo_frete?: string;
    comissao_percentual?: number;
  }) => {
    if (!isMountedRef.current || !editingVenda) return;
    updateVenda.mutate({ id: editingVenda.id, ...venda }, {
      onSuccess: () => {
        setEditingVenda(null);
      }
    });
  };

  const closeVendaModal = () => {
    if (!isMountedRef.current) return;
    setViewingVenda(null);
  };

  const handleEdit = (venda: VendaCompleta) => {
    if (!isMountedRef.current) return;
    setEditingVenda(venda);
  };

  const handleCancelEdit = () => {
    if (!isMountedRef.current) return;
    setEditingVenda(null);
  };

  const formatarMoeda = (valor: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  const formatarNumero = (valor: number) => {
    if (Number.isInteger(valor)) return String(valor);
    return valor.toFixed(2).replace('.', ',');
  };

  const exportarPDFDaVenda = (venda: VendaCompleta) => {
    try {
      const doc = new jsPDF();
      const margin = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Cabeçalho
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('Recibo de Compra', margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Cliente: ${venda.clientes?.nome || 'Cliente não informado'}`, margin, y);
      doc.text(`Data: ${new Date(venda.created_at).toLocaleDateString('pt-BR')}`, pageWidth - margin, y, { align: 'right' });
      y += 6;
      doc.text(`ID da Venda: ${venda.id}`, margin, y);

      // Linha
      y += 8;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Título Itens
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Itens', margin, y);
      y += 6;

      const linhas = venda.itens_venda.map((item) => {
        const nome = item.produtos?.nome || 'Produto';
        const qtd = item.quantidade || 0;
        const preco = item.preco_unitario || 0;
        const subtotal = item.subtotal || (qtd * preco);
        // Formato solicitado: "GOIABA 60X50 = 3000"
        return [
          nome,
          `${formatarNumero(qtd)} X ${formatarNumero(preco)}`,
          `= ${formatarNumero(subtotal)}`
        ];
      });

      autoTable(doc, {
        head: [['Produto', 'Qtd x Preço', 'Subtotal']],
        body: linhas,
        startY: y,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: { top: 2, right: 2, bottom: 2, left: 0 } },
        headStyles: { fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 50 },
          2: { halign: 'right', cellWidth: 30 },
        },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 10 : y + 10;

      // Resumo de totais
      const totalProdutos = venda.total || 0;
      const frete = venda.frete || 0;
      const desconto = venda.desconto || 0;
      const comissao = venda.comissao_valor || 0;
      const totalGeral = totalProdutos - frete - comissao + desconto;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('Resumo', margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Subtotal Produtos: ${formatarMoeda(totalProdutos)}`, margin, y);
      y += 5;
      doc.text(`Frete: ${formatarMoeda(frete)}`, margin, y);
      y += 5;
      doc.text(`Desconto: ${formatarMoeda(desconto)}`, margin, y);
      y += 5;
      doc.text(`Comissão: ${formatarMoeda(comissao)}`, margin, y);
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(`TOTAL GERAL: ${formatarMoeda(totalGeral)}`, margin, y);

      doc.save(`recibo_${venda.clientes?.nome || 'cliente'}_${new Date(venda.created_at).toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF da venda:', error);
      alert('Erro ao gerar o PDF desta venda.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Vendas</h2>
        <p className="text-muted-foreground">Gerencie as vendas do sistema</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowVendaForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Registrar Venda
        </Button>
      </div>

      {showVendaForm && (
        <Dialog open={showVendaForm} onOpenChange={setShowVendaForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Venda</DialogTitle>
            </DialogHeader>
            <VendaForm
              onSubmit={handleCreateVenda}
              onCancel={() => setShowVendaForm(false)}
              isLoading={createVenda.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {editingVenda && (
        <Dialog open={!!editingVenda} onOpenChange={() => setEditingVenda(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Venda</DialogTitle>
            </DialogHeader>
            <VendaForm
              venda={editingVenda}
              onSubmit={handleUpdateVenda}
              onCancel={handleCancelEdit}
              isLoading={updateVenda.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando vendas...</div>
          ) : vendas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma venda encontrada
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total Cliente</TableHead>
                  <TableHead>Detalhes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendas.map((venda) => {
                  const totalCliente = venda.total - (venda.frete || 0) - (venda.comissao_valor || 0) + (venda.desconto || 0);
                  return (
                  <TableRow key={venda.id}>
                    <TableCell className="font-medium">
                      {venda.clientes?.nome || 'Cliente não informado'}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">R$ {totalCliente.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Produtos: R$ {venda.total.toFixed(2)}</div>
                        <div>Frete: {venda.frete ? (venda.frete === 0 ? 'Grátis' : `R$ ${venda.frete.toFixed(2)}`) : 'R$ 0,00'}
                          {venda.tipo_frete && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({venda.tipo_frete === 'por_produto' ? 'Por Produto' : 
                                venda.tipo_frete === 'por_pedido' ? 'Por Pedido' : 
                                venda.tipo_frete === 'por_quantidade' ? 'Por Quantidade' : 
                                venda.tipo_frete})
                            </span>
                          )}
                        </div>
                        <div>Comissão: R$ {(venda.comissao_valor || 0).toFixed(2)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={venda.status === 'pago' ? 'default' : venda.status === 'pendente' ? 'secondary' : 'destructive'}>
                        {venda.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(venda.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingVenda(venda)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(venda)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(venda.id)}
                          disabled={deleteVenda.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização da Venda */}
      {viewingVenda && (
        <Dialog open={!!viewingVenda} onOpenChange={closeVendaModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Detalhes da Venda</DialogTitle>
                <Button variant="outline" size="sm" onClick={() => viewingVenda && exportarPDFDaVenda(viewingVenda)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </DialogHeader>
            <Card>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong>Cliente:</strong> {viewingVenda.clientes?.nome || 'Cliente não informado'}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <Badge variant={viewingVenda.status === 'pago' ? 'default' : viewingVenda.status === 'pendente' ? 'secondary' : 'destructive'}>
                        {viewingVenda.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Data:</strong> {new Date(viewingVenda.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {viewingVenda.desconto && (
                      <div>
                        <strong>Desconto:</strong> R$ {viewingVenda.desconto.toFixed(2)}
                      </div>
                    )}
                  </div>
                  
                  {/* Total Geral Destacado */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-800 mb-2">
                        Total Geral: R$ {(viewingVenda.total - (viewingVenda.frete || 0) - (viewingVenda.comissao_valor || 0) + (viewingVenda.desconto || 0)).toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600 space-y-1">
                        <div>Produtos: R$ {viewingVenda.total.toFixed(2)}</div>
                        <div>Frete: {viewingVenda.frete ? (viewingVenda.frete === 0 ? 'Grátis' : `R$ ${viewingVenda.frete.toFixed(2)}`) : 'R$ 0,00'}
                          {viewingVenda.tipo_frete && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({viewingVenda.tipo_frete === 'por_produto' ? 'Por Produto' : 
                                viewingVenda.tipo_frete === 'por_pedido' ? 'Por Pedido' : 
                                viewingVenda.tipo_frete === 'por_quantidade' ? 'Por Quantidade' : 
                                viewingVenda.tipo_frete})
                            </span>
                          )}
                        </div>
                        <div>Comissão: R$ {(viewingVenda.comissao_valor || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes do Frete */}
                  {viewingVenda.frete !== undefined && viewingVenda.frete > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Detalhes do Frete</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <div><strong>Tipo de Cálculo:</strong> {viewingVenda.tipo_frete === 'por_produto' ? 'Por Produto' : 
                          viewingVenda.tipo_frete === 'por_pedido' ? 'Por Pedido' : 
                          viewingVenda.tipo_frete === 'por_quantidade' ? 'Por Quantidade' : 
                          viewingVenda.tipo_frete || 'Não informado'}</div>
                        <div><strong>Valor do Frete:</strong> R$ {viewingVenda.frete.toFixed(2)}</div>
                        {freteConfig && (
                          <div className="mt-2 pt-2 border-t border-blue-200">
                            <div className="text-xs text-blue-600">
                              <div><strong>Configurações Atuais:</strong></div>
                              <div>• Tipo padrão: {freteConfig.tipoCalculo === 'por_produto' ? 'Por Produto' : 
                                freteConfig.tipoCalculo === 'por_pedido' ? 'Por Pedido' : 
                                freteConfig.tipoCalculo === 'por_quantidade' ? 'Por Quantidade' : 
                                freteConfig.tipoCalculo}</div>
                              <div>• Frete padrão: R$ {freteConfig.fretePadrao.toFixed(2)}</div>
                              <div>• Frete por quantidade: R$ {freteConfig.fretePorQuantidade.toFixed(2)}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {viewingVenda.observacoes && (
                  <div className="mb-6">
                    <strong>Observações:</strong>
                    <p className="mt-1 text-muted-foreground">{viewingVenda.observacoes}</p>
                  </div>
                )}

                <div className="mb-6">
                  <strong>Itens da Venda:</strong>
                  <div className="mt-2 space-y-2">
                    {viewingVenda.itens_venda.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                        <span>{item.produtos.nome}</span>
                        <span>{item.quantidade}x R$ {item.preco_unitario.toFixed(2)} = R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default VendasPage;