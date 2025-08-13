import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Package, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

import { useProdutos } from "@/hooks/useProdutos";
import { useClientes } from "@/hooks/useClientes";
import { useVendas } from "@/hooks/useVendas";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { produtos } = useProdutos();
  const { clientes } = useClientes();
  const { vendas } = useVendas();

  // Se ainda está carregando a autenticação, mostrar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Se não há usuário autenticado, não renderizar nada
  if (!user) {
    return null;
  }

  // Calcular métricas
  const totalProdutos = produtos.length;
  const totalClientes = clientes.length;
  const totalVendas = vendas.length;
  
  // Calcular receita total
  const receitaTotal = vendas.reduce((acc, venda) => acc + venda.total, 0);
  
  // Produtos com baixo estoque (menos de 20 unidades)
  const produtosBaixoEstoque = produtos.filter(produto => produto.estoque < 20);
  
  // Vendas do mês atual
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const vendasMes = vendas.filter(venda => new Date(venda.created_at) >= primeiroDiaMes);
  const receitaMes = vendasMes.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral do sistema LECULGO</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-accent hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {produtosLoading ? '...' : totalProdutos}
            </div>
            <p className="text-xs text-muted-foreground">
              {produtosBaixoEstoque.length} com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {clientesLoading ? '...' : totalClientes}
            </div>
            <p className="text-xs text-muted-foreground">
              {clientes.filter(c => c.ativo).length} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vendasLoading ? '...' : `R$ ${receitaTotal.toFixed(2)}`}
            </div>
            <p className="text-xs text-success">
              R$ {receitaMes.toFixed(2)} este mês
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vendasLoading ? '...' : totalVendas}
            </div>
            <p className="text-xs text-success">
              {vendasMes.length} este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Ações Rápidas e Status do Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        

        <Card>
          <CardHeader>
            <CardTitle>Status do Estoque</CardTitle>
            <CardDescription>Produtos com baixo estoque</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {produtosBaixoEstoque.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum produto com estoque baixo
              </div>
            ) : (
              <>
                {produtosBaixoEstoque.slice(0, 3).map((produto) => (
                  <div key={produto.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{produto.nome}</span>
                      <span className="text-sm text-muted-foreground">{produto.estoque} unidades</span>
                    </div>
                    <Progress 
                      value={(produto.estoque / 20) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
                {produtosBaixoEstoque.length > 3 && (
                  <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="text-sm text-warning-foreground">
                      +{produtosBaixoEstoque.length - 3} produtos com estoque baixo
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas Compactas */}
      
    </div>
  );
}

export default Dashboard;