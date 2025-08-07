import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface KeyboardShortcutsProps {
  onNewProduct?: () => void;
  onNewClient?: () => void;
  onNewSale?: () => void;
}

export function KeyboardShortcuts({ 
  onNewProduct, 
  onNewClient, 
  onNewSale 
}: KeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Só ativar atalhos se não estiver em um input ou textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Ctrl/Cmd + Shift + P = Novo Produto
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        if (onNewProduct) {
          onNewProduct();
          toast({ 
            title: 'Atalho de teclado', 
            description: 'Abrindo formulário de novo produto' 
          });
        }
      }

      // Ctrl/Cmd + Shift + C = Novo Cliente
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        if (onNewClient) {
          onNewClient();
          toast({ 
            title: 'Atalho de teclado', 
            description: 'Abrindo formulário de novo cliente' 
          });
        }
      }

      // Ctrl/Cmd + Shift + V = Nova Venda
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'V') {
        event.preventDefault();
        if (onNewSale) {
          onNewSale();
          toast({ 
            title: 'Atalho de teclado', 
            description: 'Abrindo formulário de nova venda' 
          });
        }
      }

      // F1 = Mostrar ajuda
      if (event.key === 'F1') {
        event.preventDefault();
        toast({ 
          title: 'Atalhos de Teclado', 
          description: 'Ctrl+Shift+P: Novo Produto | Ctrl+Shift+C: Novo Cliente | Ctrl+Shift+V: Nova Venda' 
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNewProduct, onNewClient, onNewSale, toast]);

  return null; // Este componente não renderiza nada
} 