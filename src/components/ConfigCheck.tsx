import { hasValidSupabaseConfig } from '@/integrations/supabase/client';

export const ConfigCheck = ({ children }: { children: React.ReactNode }) => {
  if (!hasValidSupabaseConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full space-y-4 text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Configuração Pendente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              As variáveis de ambiente do Supabase precisam ser configuradas.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
            <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
              Variáveis necessárias:
            </h3>
            <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <div>• VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌'}</div>
              <div>• VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌'}</div>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>Na Vercel: Settings → Environment Variables</p>
            <p>Local: arquivo .env na raiz do projeto</p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};