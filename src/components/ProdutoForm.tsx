import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Produto } from '@/hooks/useProdutos';

interface ProdutoFormProps {
  produto?: Produto;
  onSubmit: (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ProdutoForm({ produto, onSubmit, onCancel, isLoading }: ProdutoFormProps) {
  const [formData, setFormData] = useState({
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    preco: produto ? String(produto.preco ?? '') : '',
    estoque: produto ? String(produto.estoque ?? '0') : '0',
    categoria: produto?.categoria || '',
    frete: produto ? String(produto.frete ?? '') : '',
    ativo: produto?.ativo ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.nome.trim()) {
      alert('O nome do produto é obrigatório');
      return;
    }
    
    const precoNum = parseFloat(formData.preco);
    if (!formData.preco || isNaN(precoNum) || precoNum <= 0) {
      alert('O preço deve ser um número maior que zero');
      return;
    }
    
    const estoqueNum = parseInt(formData.estoque);
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      alert('O estoque deve ser um número não negativo');
      return;
    }
    
    let freteNum: number | null = null;
    if (formData.frete !== '') {
      freteNum = parseFloat(formData.frete);
      if (isNaN(freteNum) || freteNum < 0) {
        alert('O frete deve ser um número não negativo');
        return;
      }
    }

    onSubmit({
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      preco: precoNum,
      estoque: estoqueNum,
      categoria: formData.categoria.trim() || undefined,
      frete: freteNum,
      ativo: formData.ativo
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{produto ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
        {produto && (
          <p className="text-sm text-muted-foreground">
            Editando: {produto.nome}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Digite o nome do produto"
            />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Digite a descrição do produto"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="preco">Preço *</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                required
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="frete">Frete Personalizado (R$)</Label>
              <Input
                id="frete"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.frete}
                onChange={(e) => setFormData({ ...formData, frete: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe vazio ou 0 para usar frete padrão do sistema
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="estoque">Estoque</Label>
            <Input
              id="estoque"
              type="number"
              min="0"
              value={formData.estoque}
              onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input
              id="categoria"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              placeholder="Digite a categoria"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Salvando...' : produto ? 'Atualizar' : 'Criar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}