import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  private debugLog?: (type: string, message: string, details?: any, stack?: string) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.error('🚨 ErrorBoundary: Erro capturado:', error);
    
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    console.error('🚨 ErrorBoundary: Detalhes do erro:', errorDetails);
    
    // Tentar registrar no sistema de debug se disponível
    try {
      // Enviar evento customizado para ser capturado pelo useDebug
      window.dispatchEvent(new CustomEvent('debug-log', {
        detail: {
          type: 'error',
          message: `ErrorBoundary: ${error.message}`,
          details: errorDetails,
          stack: error.stack
        }
      }));
    } catch (e) {
      console.warn('Não foi possível registrar erro no sistema de debug:', e);
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
    
    // Log da recuperação
    try {
      window.dispatchEvent(new CustomEvent('debug-log', {
        detail: {
          type: 'info',
          message: 'ErrorBoundary: Componente resetado pelo usuário',
          details: { action: 'reset', timestamp: new Date().toISOString() }
        }
      }));
    } catch (e) {
      console.warn('Não foi possível registrar reset no sistema de debug:', e);
    }
  };

  handleCopyError = () => {
    if (this.state.error && this.state.errorInfo) {
      const errorReport = {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        error: {
          name: this.state.error.name,
          message: this.state.error.message,
          stack: this.state.error.stack
        },
        componentStack: this.state.errorInfo.componentStack
      };

      navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => {
          console.log('Relatório de erro copiado para o clipboard');
        })
        .catch(err => {
          console.error('Erro ao copiar para clipboard:', err);
        });
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Oops! Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. O problema foi registrado automaticamente para análise.
              </CardDescription>
              {this.state.errorId && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">
                    ID do Erro: <code className="bg-muted px-1 rounded">{this.state.errorId}</code>
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-destructive mb-2">Erro (desenvolvimento):</p>
                  <p className="text-xs text-muted-foreground font-mono break-all mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver stack trace completo
                      </summary>
                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap break-all max-h-40 overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                        Ver component stack
                      </summary>
                      <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap break-all max-h-40 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-2 flex-wrap">
                <Button onClick={this.handleReset} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recarregar Página
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="secondary" 
                    onClick={this.handleCopyError}
                    className="flex-1"
                  >
                    <Bug className="mr-2 h-4 w-4" />
                    Copiar Erro
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>💡 <strong>Dica:</strong> Ative o Debug Panel (canto inferior direito) para ver mais detalhes</p>
                <p>🔄 Se o problema persistir, tente limpar o cache do navegador</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;