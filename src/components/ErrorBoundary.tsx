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
}

export default ErrorBoundary;