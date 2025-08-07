import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Keyboard, MousePointer, Zap } from 'lucide-react';

export function HelpModal() {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    {
      key: 'Ctrl + Shift + P',
      description: 'Cadastrar novo produto',
      icon: <Zap className="h-4 w-4" />
    },
    {
      key: 'Ctrl + Shift + C',
      description: 'Adicionar novo cliente',
      icon: <Zap className="h-4 w-4" />
    },
    {
      key: 'Ctrl + Shift + V',
      description: 'Registrar nova venda',
      icon: <Zap className="h-4 w-4" />
    },
    {
      key: 'F1',
      description: 'Mostrar esta ajuda',
      icon: <HelpCircle className="h-4 w-4" />
    }
  ];

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Acesse ações rápidas diretamente no dashboard',
      icon: <MousePointer className="h-4 w-4" />
    },
    {
      title: 'Páginas',
      description: 'Use os botões de ações rápidas em cada página',
      icon: <MousePointer className="h-4 w-4" />
    },
    {
      title: 'Modais',
      description: 'Formulários abrem em modais para facilitar o uso',
      icon: <MousePointer className="h-4 w-4" />
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Ajuda
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Ajuda - Ações Rápidas
          </DialogTitle>
          <DialogDescription>
            Descubra como usar as funcionalidades de ações rápidas do sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Atalhos de Teclado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Atalhos de Teclado
              </CardTitle>
              <CardDescription>
                Use estes atalhos para acessar rapidamente as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {shortcut.icon}
                      <span className="text-sm">{shortcut.description}</span>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Formas de acessar as funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    {action.icon}
                    <div>
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card>
            <CardHeader>
              <CardTitle>Dicas de Uso</CardTitle>
              <CardDescription>
                Aproveite ao máximo as funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Use os atalhos de teclado para maior produtividade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Os formulários abrem em modais para não perder o contexto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>As ações rápidas estão disponíveis em todas as páginas principais</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Pressione F1 a qualquer momento para ver esta ajuda</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 