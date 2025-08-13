import React from 'react';
import { hasValidSupabaseConfig } from '@/integrations/supabase/client';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = Date.now().toString(36);
    
    console.error(`Error Boundary caught an error [${errorId}]:`, error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Se for erro 401, limpar localStorage e redirecionar
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      localStorage.clear();
      window.location.href = '/';
      return;
    }
    
    // Log detalhado do erro
    const errorDetails = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      supabaseConfig: {
        url: import.meta.env.VITE_SUPABASE_URL ? 'configurado' : 'não configurado',
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configurado' : 'não configurado',
        hasValidConfig: hasValidSupabaseConfig
      }
    };
    
    // Salvar logs no localStorage para debug (com fallback)
    try {
      const existingLogs = JSON.parse(localStorage.getItem('error-logs') || '[]');
      const updatedLogs = [errorDetails, ...existingLogs.slice(0, 9)]; // Manter apenas os últimos 10
      localStorage.setItem('error-logs', JSON.stringify(updatedLogs));
    } catch (storageError) {
      console.warn('Falha ao salvar logs de erro:', storageError);
    }
  }

  render() {
    if (this.state.hasError) {
      // Verificar se o erro é relacionado à configuração do Supabase
      const isConfigError = !hasValidSupabaseConfig;
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full space-y-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
                {isConfigError ? 'Erro de Configuração' : 'Algo deu errado'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isConfigError 
                  ? 'As variáveis de ambiente do Supabase não estão configuradas corretamente.'
                  : 'Ocorreu um erro inesperado na aplicação.'
                }
              </p>
            </div>
            
            {isConfigError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Configuração necessária:
                </h3>
                <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• VITE_SUPABASE_URL</li>
                  <li>• VITE_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                  Verifique as variáveis de ambiente na Vercel ou no arquivo .env local.
                </p>
              </div>
            )}
            
            {this.state.error && (
              <details className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Detalhes técnicos
                </summary>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-mono">
                  <div>Erro: {this.state.error.message}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-2">
                      Stack: {this.state.errorInfo.componentStack.slice(0, 200)}...
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Limpar Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;