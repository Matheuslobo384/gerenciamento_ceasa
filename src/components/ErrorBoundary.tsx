import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.error('ErrorBoundary capturou um erro:', errorId, error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Verificar se é erro de autenticação 401
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('Erro de autenticação detectado - redirecionando para login');
      localStorage.clear(); // Limpar cache local
      window.location.href = '/'; // Redirecionar para login
      return;
    }

    // Salvar no localStorage para debug
    try {
      const errorLog = {
        id: errorId,
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        supabaseInfo: {
          url: import.meta.env.VITE_SUPABASE_URL ? 'configurado' : 'não configurado',
          key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'configurado' : 'não configurado'
        }
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.unshift(errorLog);
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs.slice(0, 10)));
    } catch (e) {
      console.error('Erro ao salvar log:', e);
    }
  }

  // Adicionado: método obrigatório de renderização com fallback
  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || 'Erro desconhecido';
      return (
        <div style={{ padding: 24 }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Ocorreu um erro na interface</h1>
          <p style={{ color: '#666', marginBottom: 16 }}>
            {message}
          </p>
          {this.state.errorInfo?.componentStack && (
            <pre
              style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 8,
                overflowX: 'auto',
                maxHeight: 200
              }}
            >
              {this.state.errorInfo.componentStack}
            </pre>
          )}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 12px',
                background: '#111827',
                color: '#fff',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Recarregar página
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}
              style={{
                padding: '8px 12px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Limpar cache e voltar ao login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;