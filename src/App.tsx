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

// Pages
import Index from '@/pages/Index';
import Dashboard from '@/components/Dashboard';
import ProdutosPage from '@/pages/ProdutosPage';
import ClientesPage from '@/pages/ClientesPage';
import VendasPage from '@/pages/VendasPage';
import RelatoriosPage from '@/pages/RelatoriosPage';
import ConfiguracoesPage from '@/pages/ConfiguracoesPage';
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const { promptEvent, promptToInstall } = useInstallPrompt();
  const [showInstallPopup, setShowInstallPopup] = useState(false);

  useEffect(() => {
    if (promptEvent) {
      setShowInstallPopup(true);
    }
  }, [promptEvent]);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              {/* Public route - Login */}
              <Route path="/login" element={<Index />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/produtos"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ProdutosPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ClientesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vendas"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <VendasPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/relatorios"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <RelatoriosPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ConfiguracoesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teste-frete"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TesteFreteQuantidade />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          
          <Toaster />
          
          {showInstallPopup && (
            <InstallPwaPopup
              onInstall={() => {
                promptToInstall();
                setShowInstallPopup(false);
              }}
              onDismiss={() => setShowInstallPopup(false)}
            />
          )}
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;