import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit2 } from 'lucide-react';
import { Produto } from '@/hooks/useProdutos';

interface ProdutoInlineEditProps {
  produto: Produto;
  field: keyof Produto;
  onSave: (id: string, field: keyof Produto, value: any) => void;
  isLoading?: boolean;
}

export function ProdutoInlineEdit({ produto, field, onSave, isLoading }: ProdutoInlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(produto[field]?.toString() || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setValue(produto[field]?.toString() || '');
  };

  const handleSave = () => {
    if (field === 'preco' || field === 'estoque' || field === 'frete') {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        alert('Por favor, insira um valor válido');
        return;
      }
      onSave(produto.id, field, numValue);
    } else {
      onSave(produto.id, field, value.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue(produto[field]?.toString() || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          type={field === 'preco' || field === 'estoque' || field === 'frete' ? 'number' : 'text'}
          step={field === 'preco' || field === 'frete' ? '0.01' : '1'}
          min={field === 'estoque' ? '0' : undefined}
          className={field === 'nome' || field === 'categoria' ? 'w-32' : 'w-20'}
          disabled={isLoading}
          placeholder={field === 'nome' ? 'Nome' : field === 'categoria' ? 'Categoria' : '0'}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const displayValue = () => {
    const val = produto[field];
    if (field === 'preco' || field === 'frete') {
      return val ? `R$ ${Number(val).toFixed(2)}` : '-';
    }
    if (field === 'estoque') {
      return `${val} unidades`;
    }
    return val || '-';
  };

  return (
    <div className="flex items-center gap-1 group">
      <span className="min-w-0 flex-1">{displayValue()}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleStartEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  );
} 