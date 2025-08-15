import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useVendas } from '@/hooks/useVendas';
import { useProdutos } from '@/hooks/useProdutos';
import { useClientes } from '@/hooks/useClientes';
import { TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign, Calendar, Download, FileText, Table, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { formatarMoeda, formatarNumero } from '@/lib/utils';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface PeriodoFiltro {
  inicio: string;
  fim: string;
}

interface DataHoraPersonalizada {
  data: string;
  hora: string;
}

export default function RelatoriosPage() {
  const { vendas, isLoading: vendasLoading } = useVendas();
  const { produtos, isLoading: produtosLoading } = useProdutos();
  const { clientes, isLoading: clientesLoading } = useClientes();
  
  const [periodo, setPeriodo] = useState<PeriodoFiltro>({
    inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fim: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  
  const [tipoRelatorio, setTipoRelatorio] = useState<'geral' | 'vendas' | 'produtos' | 'clientes'>('geral');
  const [clienteSelecionado, setClienteSelecionado] = useState<string>('todos');
  const [dataHoraPersonalizada, setDataHoraPersonalizada] = useState<DataHoraPersonalizada>({
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: format(new Date(), 'HH:mm')
  });

  // Filtrar vendas por período e cliente
  const vendasFiltradas = useMemo(() => {
    if (!vendas || !periodo.inicio || !periodo.fim) return [];
    
    return vendas.filter(venda => {
      const dataVenda = parseISO(venda.created_at);
      const dentroPeríodo = isWithinInterval(dataVenda, {
        start: parseISO(periodo.inicio),
        end: parseISO(periodo.fim + 'T23:59:59')
      });
      
      const clienteCorreto = clienteSelecionado === 'todos' || venda.cliente_id === clienteSelecionado;
      
      return dentroPeríodo && clienteCorreto;
    });
  }, [vendas, periodo, clienteSelecionado]);

  // Calcular estatísticas gerais
  const estatisticas = useMemo(() => {
    const totalVendas = vendasFiltradas.length;
    const faturamentoTotal = vendasFiltradas.reduce((acc, venda) => acc + (venda.total || 0), 0);
    const comissaoTotal = vendasFiltradas.reduce((acc, venda) => acc + (venda.comissao_valor || 0), 0);
    const freteTotal = vendasFiltradas.reduce((acc, venda) => acc + (venda.frete || 0), 0);
    const lucroLiquidoTotal = faturamentoTotal - comissaoTotal - freteTotal;
    
    // Produtos mais vendidos
    const produtosVendidos = new Map<string, { nome: string; quantidade: number; faturamento: number }>();
    
    vendasFiltradas.forEach(venda => {
      venda.itens_venda?.forEach(item => {
        const produtoId = item.produto_id || 'sem-produto';
        const nome = item.produtos?.nome || 'Produto não encontrado';
        const quantidade = item.quantidade || 0;
        const faturamento = item.subtotal || 0;
        
        if (produtosVendidos.has(produtoId)) {
          const atual = produtosVendidos.get(produtoId)!;
          produtosVendidos.set(produtoId, {
            nome,
            quantidade: atual.quantidade + quantidade,
            faturamento: atual.faturamento + faturamento
          });
        } else {
          produtosVendidos.set(produtoId, { nome, quantidade, faturamento });
        }
      });
    });
    
    const topProdutos = Array.from(produtosVendidos.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
    
    // Clientes que mais compraram
    const clientesCompradores = new Map<string, { nome: string; compras: number; faturamento: number }>();
    
    vendasFiltradas.forEach(venda => {
      const clienteId = venda.cliente_id || 'sem-cliente';
      const nome = venda.clientes?.nome || 'Cliente não informado';
      const faturamento = venda.total || 0;
      
      if (clientesCompradores.has(clienteId)) {
        const atual = clientesCompradores.get(clienteId)!;
        clientesCompradores.set(clienteId, {
          nome,
          compras: atual.compras + 1,
          faturamento: atual.faturamento + faturamento
        });
      } else {
        clientesCompradores.set(clienteId, { nome, compras: 1, faturamento });
      }
    });
    
    const topClientes = Array.from(clientesCompradores.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.faturamento - a.faturamento)
      .slice(0, 5);

    return {
      totalVendas,
      faturamentoTotal,
      comissaoTotal,
      freteTotal,
      lucroLiquidoTotal, // Alterado de totalGeral para lucroLiquidoTotal
      topProdutos,
      topClientes
    };
  }, [vendasFiltradas]);

  const isLoading = vendasLoading || produtosLoading || clientesLoading;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Funções auxiliares para geração do PDF
  const addHeader = (doc: jsPDF, periodo: PeriodoFiltro, clienteNome: string) => {
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Título principal - seguindo o design da imagem
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85); // Cor mais suave
    doc.text('Relatório Financeiro', margin, 35);
    
    // Informações do período e cliente - layout da imagem
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    
    const periodoTexto = `Período de ${format(parseISO(periodo.inicio), 'dd/MM/yyyy')} a ${format(parseISO(periodo.fim), 'dd/MM/yyyy')}`;
    const clienteTexto = `Cliente: ${clienteNome}`;
    const dataGeracao = `Gerado em: ${format(parseISO(dataHoraPersonalizada.data), 'dd/MM/yyyy')} às ${dataHoraPersonalizada.hora}`;
    
    doc.text(periodoTexto, margin, 50);
    doc.text(clienteTexto, margin, 62);
    doc.text(dataGeracao, pageWidth - margin, 50, { align: 'right' });
    
    // Linha separadora sutil
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, 75, pageWidth - margin, 75);
  };

  const addSummary = (doc: jsPDF, estatisticas: any, startY: number) => {
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = startY + 25;
    
    // Seção RECEITAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94); // Verde
    doc.text('RECEITAS', margin, yPosition);
    yPosition += 20;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Faturamento Bruto (Vendas de Produtos)', margin, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text(formatarMoeda(estatisticas.faturamentoTotal), pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 30;
    
    // Seção DESPESAS OPERACIONAIS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(239, 68, 68); // Vermelho
    doc.text('DESPESAS OPERACIONAIS', margin, yPosition);
    yPosition += 20;
    
    // Frete
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('(-) Frete Total', margin, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`- ${formatarMoeda(estatisticas.freteTotal)}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Comissão
    doc.text('(-) Comissão Total', margin, yPosition);
    doc.text(`- ${formatarMoeda(estatisticas.comissaoTotal)}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 40;
    
    // Linha separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition - 10, pageWidth - margin, yPosition - 10);
    
    // VALOR LÍQUIDO A RECEBER - destaque especial
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85);
    doc.text('VALOR LÍQUIDO A RECEBER', margin, yPosition);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94); // Verde destacado
    doc.text(formatarMoeda(estatisticas.lucroLiquidoTotal), pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Subtítulo explicativo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('(Faturamento - Frete - Comissão)', margin, yPosition);
    
    return yPosition + 30;
  };

  const addFooter = (doc: jsPDF) => {
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Linha separadora
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);
    
    // Texto do rodapé
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('LECULGO - Sistema de Gerenciamento de Mercadorias', margin, pageHeight - 22);
    doc.text(`Página 1`, pageWidth - margin, pageHeight - 22, { align: 'right' });
  };

  const exportarPDF = () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 0;

      const clienteNome = clienteSelecionado === 'todos' 
        ? 'Todos os clientes' 
        : clientes?.find(c => c.id === clienteSelecionado)?.nome || 'N/A';

      addHeader(doc, periodo, clienteNome);
      yPosition = addSummary(doc, estatisticas, 75);

      // --- TABELA DE VENDAS DETALHADAS ---
      if (vendasFiltradas.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(51, 65, 85);
        doc.text('Detalhes das Vendas', margin, yPosition);
        yPosition += 20;

        const tableData = vendasFiltradas.map(venda => [
          format(parseISO(venda.created_at), 'dd/MM/yy'),
          (venda.clientes?.nome || 'N/A').substring(0, 20),
          formatarMoeda(venda.total || 0),
          formatarMoeda(venda.frete || 0),
          formatarMoeda(venda.comissao_valor || 0),
          formatarMoeda((venda.total || 0) - (venda.frete || 0) - (venda.comissao_valor || 0))
        ]);
      
        autoTable(doc, {
          startY: yPosition,
          head: [['Data', 'Cliente', 'Faturado', 'Frete', 'Comissão', 'Líquido']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [71, 85, 105], // Cor mais sóbria
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
          },
          styles: {
            fontSize: 8,
            cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
            lineColor: [226, 232, 240],
            lineWidth: 0.5,
          },
          columnStyles: {
            0: { cellWidth: 60, halign: 'center', font: 'courier' },
            1: { cellWidth: 'auto' },
            2: { halign: 'right', cellWidth: 80, font: 'courier' },
            3: { halign: 'right', cellWidth: 70, font: 'courier' },
            4: { halign: 'right', cellWidth: 70, font: 'courier' },
            5: { halign: 'right', cellWidth: 80, fontStyle: 'bold', font: 'courier' }
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
              const valor = parseFloat(data.cell.raw?.toString().replace(/[^0-9,-]+/g, "").replace(",", ".") || '0');
              if (valor > 0) {
                data.cell.styles.textColor = [34, 197, 94]; // Verde para lucro positivo
              }
            }
          },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 30;
      }

      // --- ITENS POR VENDA - Design conforme segunda imagem ---
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);
      doc.text('Itens por venda', margin, yPosition);
      yPosition += 25;

      vendasFiltradas.forEach((venda, index) => {
        // Subtítulo com data e cliente (formato da segunda imagem)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const dataVenda = format(parseISO(venda.created_at), 'dd/MM/yy');
        const clienteVenda = venda.clientes?.nome || 'N/A';
        doc.text(`${dataVenda} - ${clienteVenda}`, margin, yPosition);
        yPosition += 15;

        const linhas = (venda.itens_venda || []).map((item) => {
          const nome = item.produtos?.nome || 'Produto';
          const qtd = item.quantidade || 0;
          const preco = item.preco_unitario || 0;
          const subtotal = item.subtotal || (qtd * preco);
          
          // Formatação conforme a segunda imagem
          const qtdFormatada = formatarNumero(qtd, 0);
          const precoFormatado = formatarMoeda(preco);
          const qtdPreco = `${qtdFormatada} x ${precoFormatado}`;

          return [nome, qtdPreco, formatarMoeda(subtotal)];
        });

        if (linhas.length > 0) {
          autoTable(doc, {
            head: [['Produto', 'Qtd x Preço', 'Subtotal']],
            body: linhas,
            startY: yPosition,
            theme: 'grid',
            headStyles: { 
              fillColor: [248, 250, 252],
              textColor: [71, 85, 105],
              fontStyle: 'bold',
              fontSize: 9,
              halign: 'center'
            },
            styles: {
              fontSize: 8,
              cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
              lineWidth: 0.5,
              lineColor: [226, 232, 240],
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'left' },
              1: { cellWidth: 120, halign: 'center', font: 'courier' },
              2: { cellWidth: 80, halign: 'right', font: 'courier' },
            },
          });
          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }
      });

      addFooter(doc);

      const nomeArquivo = `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
      doc.save(nomeArquivo);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    }
  };

  const exportarCSV = () => {
    try {
      const csvData: (string | number)[][] = [];

      // Título do Relatório
      csvData.push(['RELATÓRIO DE VENDAS - ESTILO NOTA FISCAL']);
      csvData.push([]); // Linha em branco

      // Informações do Período
      const clienteNome = clienteSelecionado === 'todos' ? 'Todos os clientes' : clientes?.find(c => c.id === clienteSelecionado)?.nome || 'N/A';
      csvData.push(['Período de', format(parseISO(periodo.inicio), 'dd/MM/yyyy'), 'a', format(parseISO(periodo.fim), 'dd/MM/yyyy')]);
      csvData.push(['Cliente selecionado', clienteNome]);
      csvData.push(['Data de Geração', `${format(parseISO(dataHoraPersonalizada.data), 'dd/MM/yyyy')} às ${dataHoraPersonalizada.hora}`]);
      csvData.push([]); // Linha em branco

      // Processar cada venda individualmente
      vendasFiltradas.forEach((venda, index) => {
        // Separador entre as vendas
        if (index > 0) {
          csvData.push(['---', '---', '---', '---', '---', '---']);
        }

        // Dados da Venda e do Cliente
        csvData.push(['DADOS DA VENDA']);
        csvData.push(['ID Venda', venda.id]);
        csvData.push(['Data', format(parseISO(venda.created_at), 'dd/MM/yyyy HH:mm')]);
        csvData.push(['Status', venda.status]);
        csvData.push([]);
        
        csvData.push(['DADOS DO CLIENTE']);
        csvData.push(['Cliente', venda.clientes?.nome || 'N/A']);
        csvData.push(['CPF/CNPJ', venda.clientes?.cpf_cnpj || 'N/A']);
        csvData.push(['Telefone', venda.clientes?.telefone || 'N/A']);
        csvData.push(['Endereço', venda.clientes?.endereco || 'N/A']);
        csvData.push([]);

        // Itens da Venda
        csvData.push(['ITENS DA VENDA']);
        csvData.push(['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']);
        venda.itens_venda.forEach(item => {
          csvData.push([
            item.produtos?.nome || 'N/A',
            item.quantidade,
            item.preco_unitario.toFixed(2).replace('.', ','),
            item.subtotal.toFixed(2).replace('.', ',')
          ]);
        });
        csvData.push([]);

        // Totais da Venda
        csvData.push(['TOTAIS']);
        csvData.push(['Subtotal Produtos', venda.total.toFixed(2).replace('.', ',')]);
        csvData.push(['Frete (Despesa)', `-${(venda.frete || 0).toFixed(2).replace('.', ',')}`]);
        csvData.push(['Desconto', `-${(venda.desconto || 0).toFixed(2).replace('.', ',')}`]);
        csvData.push(['Comissão (Despesa)', `-${(venda.comissao_valor || 0).toFixed(2).replace('.', ',')} R$`]);
        const lucroVenda = (venda.total || 0) - (venda.frete || 0) - (venda.desconto || 0) - (venda.comissao_valor || 0);
        csvData.push(['TOTAL LÍQUIDO', lucroVenda.toFixed(2).replace('.', ',')]);
        csvData.push([]);

      });

      const csv = Papa.unparse(csvData, {
        delimiter: ';',
        header: false,
      });

      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csv;

      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_vendas_notas_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      alert('Erro ao gerar o relatório CSV. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Button onClick={exportarPDF} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
          <FileText className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="inicio">Data Início</Label>
              <Input
                id="inicio"
                type="date"
                value={periodo.inicio}
                onChange={(e) => setPeriodo(prev => ({ ...prev, inicio: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="fim">Data Fim</Label>
              <Input
                id="fim"
                type="date"
                value={periodo.fim}
                onChange={(e) => setPeriodo(prev => ({ ...prev, fim: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dataPersonalizada">Data do Relatório</Label>
              <Input
                id="dataPersonalizada"
                type="date"
                value={dataHoraPersonalizada.data}
                onChange={(e) => setDataHoraPersonalizada(prev => ({ ...prev, data: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="horaPersonalizada">Hora do Relatório</Label>
              <Input
                id="horaPersonalizada"
                type="time"
                value={dataHoraPersonalizada.hora}
                onChange={(e) => setDataHoraPersonalizada(prev => ({ ...prev, hora: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os clientes</SelectItem>
                  {clientes?.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={(value: any) => setTipoRelatorio(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Relatório Geral</SelectItem>
                  <SelectItem value="vendas">Vendas Detalhadas</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setPeriodo({
                    inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                    fim: format(endOfMonth(new Date()), 'yyyy-MM-dd')
                  });
                  setClienteSelecionado('todos');
                  setDataHoraPersonalizada({
                    data: format(new Date(), 'yyyy-MM-dd'),
                    hora: format(new Date(), 'HH:mm')
                  });
                }}
                variant="outline"
                className="w-full"
              >
                Resetar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{estatisticas.totalVendas}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento (Produtos)</p>
                <p className="text-2xl font-bold">{formatarMoeda(estatisticas.faturamentoTotal)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Comissão Total (Despesa)</p>
                <p className="text-2xl font-bold text-red-600">- {formatarMoeda(estatisticas.comissaoTotal)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Frete Total (Despesa)</p>
                <p className="text-2xl font-bold text-red-600">- {formatarMoeda(estatisticas.freteTotal)}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Lucro Líquido Total</p>
                <p className="text-2xl font-bold text-green-800">{formatarMoeda(estatisticas.lucroLiquidoTotal)}</p>
                <p className="text-xs text-green-600 mt-1">Faturamento - Despesas</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo baseado no tipo de relatório */}
      {tipoRelatorio === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Produtos */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estatisticas.topProdutos.map((produto, index) => (
                  <div key={produto.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{produto.nome}</p>
                        <p className="text-sm text-muted-foreground">{produto.quantidade} unidades</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatarMoeda(produto.faturamento)}</p>
                    </div>
                  </div>
                ))}
                {estatisticas.topProdutos.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhum produto vendido no período</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Melhores Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {estatisticas.topClientes.map((cliente, index) => (
                  <div key={cliente.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.compras} compras</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatarMoeda(cliente.faturamento)}</p>
                    </div>
                  </div>
                ))}
                {estatisticas.topClientes.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">Nenhuma venda no período</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Relatório de Vendas Detalhadas */}
      {tipoRelatorio === 'vendas' && (
        <Card>
          <CardHeader>
            <CardTitle>Vendas Detalhadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">CPF/CNPJ</th>
                    <th className="text-left p-2">Telefone</th>
                    <th className="text-left p-2">Endereço</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Itens</th>
                    <th className="text-right p-2">Total</th>
                    <th className="text-right p-2">Comissão</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradas.map((venda) => (
                    <tr key={venda.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {venda.created_at ? format(parseISO(venda.created_at), 'dd/MM/yyyy') : 'N/A'}
                      </td>
                      <td className="p-2">{venda.clientes?.nome || 'Cliente não informado'}</td>
                      <td className="p-2">{venda.clientes?.cpf_cnpj || 'Não informado'}</td>
                      <td className="p-2">{venda.clientes?.telefone || 'Não informado'}</td>
                      <td className="p-2 max-w-xs truncate" title={venda.clientes?.endereco || 'Não informado'}>
                        {venda.clientes?.endereco || 'Não informado'}
                      </td>
                      <td className="p-2">
                        <Badge variant={venda.status === 'concluida' ? 'default' : 'secondary'}>
                          {venda.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-2">
                        {venda.itens_venda?.length || 0} item(s)
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatarMoeda(venda.total || 0)}
                      </td>
                      <td className="p-2 text-right font-medium text-green-600">
                        {venda.comissao_valor ? formatarMoeda(venda.comissao_valor) : 'R$ 0,00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {vendasFiltradas.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Nenhuma venda encontrada no período</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Produtos */}
      {tipoRelatorio === 'produtos' && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtos?.map((produto) => {
                const vendidoNoPeriodo = estatisticas.topProdutos.find(p => p.id === produto.id);
                return (
                  <div key={produto.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{produto.nome}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Preço: {formatarMoeda(produto.preco || 0)}</p>
                      <p>Estoque: {produto.estoque || 0} unidades</p>
                      {vendidoNoPeriodo && (
                        <p className="text-green-600 font-medium">
                          Vendido: {vendidoNoPeriodo.quantidade} unidades
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relatório de Clientes */}
      {tipoRelatorio === 'clientes' && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientes?.map((cliente) => {
                const comprasNoPeriodo = estatisticas.topClientes.find(c => c.id === cliente.id);
                return (
                  <div key={cliente.id} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{cliente.nome}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><strong>CPF/CNPJ:</strong> {cliente.cpf_cnpj || 'Não informado'}</p>
                      <p><strong>Email:</strong> {cliente.email || 'Não informado'}</p>
                      <p><strong>Telefone:</strong> {cliente.telefone || 'Não informado'}</p>
                      {cliente.endereco && (
                        <p><strong>Endereço:</strong> {cliente.endereco}</p>
                      )}
                      {/* Campos opcionais omitidos pois não existem no tipo Cliente */}
                      {comprasNoPeriodo && (
                        <div className="text-green-600 font-medium mt-2 pt-2 border-t">
                          <p>Compras no período: {comprasNoPeriodo.compras}</p>
                          <p>Total faturado: {formatarMoeda(comprasNoPeriodo.faturamento)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}