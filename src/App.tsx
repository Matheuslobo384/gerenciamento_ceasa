import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/components/Layout';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { InstallPwaPopup } from '@/components/InstallPwaPopup';
import ErrorBoundary from '@/components/ErrorBoundary';
import { DebugPanel } from '@/components/DebugPanel';

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import ProdutosPage from '@/pages/ProdutosPage';
import ClientesPage from '@/pages/ClientesPage';
import VendasPage from '@/pages/VendasPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import TesteFreteQuantidade from '@/components/TesteFreteQuantidade';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { promptEvent, showInstallPopup, dismissInstallPrompt } = useInstallPrompt();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Router>
            {!user ? (
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/produtos" element={<ProdutosPage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/vendas" element={<VendasPage />} />
                  <Route path="/relatorios" element={<RelatoriosPage />} />
                  <Route path="/teste-frete" element={<TesteFreteQuantidade />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            )}
          </Router>
          
          {/* Install PWA Popup */}
          {showInstallPopup && (
            <InstallPwaPopup
              onInstall={() => {
                if (promptEvent) {
                  promptEvent.prompt();
                  promptEvent.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                      console.log('User accepted the install prompt');
                    } else {
                      console.log('User dismissed the install prompt');
                    }
                  });
                }
                dismissInstallPrompt();
              }}
              onDismiss={dismissInstallPrompt}
            />
          )}
          
          {/* Debug Panel */}
          <DebugPanel />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

function App() {
  return <ProtectedRoute><></></ProtectedRoute>;
}

export default App;