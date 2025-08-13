import { useState, useEffect } from 'react';

interface DebugLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info' | 'network';
  message: string;
  details?: any;
  stack?: string;
}

export function useDebug() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const addLog = (type: DebugLog['type'], message: string, details?: any, stack?: string) => {
    const log: DebugLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details,
      stack
    };

    setLogs(prev => [log, ...prev].slice(0, 100)); // Manter apenas os últimos 100 logs
    
    // Log no console com cores
    const styles = {
      error: 'color: #ff4444; font-weight: bold;',
      warning: 'color: #ffaa00; font-weight: bold;',
      info: 'color: #4444ff; font-weight: bold;',
      network: 'color: #44ff44; font-weight: bold;'
    };
    
    console.log(`%c[${type.toUpperCase()}] ${message}`, styles[type]);
    if (details) console.log('Detalhes:', details);
    if (stack) console.log('Stack:', stack);
  };

  const clearLogs = () => setLogs([]);
  
  const toggleDebugMode = () => setIsDebugMode(prev => !prev);

  // Interceptar erros globais
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      addLog('error', `Erro Global: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, event.error?.stack);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addLog('error', `Promise Rejeitada: ${event.reason}`, event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return {
    logs,
    isDebugMode,
    addLog,
    clearLogs,
    toggleDebugMode
  };
}