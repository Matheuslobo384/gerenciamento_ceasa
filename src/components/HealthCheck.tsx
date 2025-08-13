import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const HealthCheck = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Verificar conexão com Supabase
        const { data, error } = await supabase.from('configuracoes').select('id').limit(1);
        
        if (error) {
          throw new Error(`Supabase Error: ${error.message}`);
        }
        
        setStatus('healthy');
      } catch (err) {
        console.error('Health check failed:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        setStatus('error');
      }
    };

    checkHealth();
  }, []);

  if (status === 'checking') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Verificando conexão com o banco de dados...</AlertDescription>
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Erro de conexão: {error}
          <br />
          <small>Verifique as variáveis de ambiente na Vercel</small>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>Sistema funcionando normalmente</AlertDescription>
    </Alert>
  );
};