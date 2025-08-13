import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, ShoppingCart, BarChart3, Package } from 'lucide-react';

const Index = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Animação de entrada
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(savedCredentials);
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      // Salvar ou remover credenciais baseado na opção "lembrar"
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          email,
          password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
      
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Hero Content */}
          <div className={`hidden lg:block space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl shadow-lg">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  LECULGO
                </h1>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200">
                Gerenciamento de Mercadorias
              </h2>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Controle completo do seu negócio com uma plataforma moderna e intuitiva. 
                Gerencie produtos, clientes, vendas e relatórios de forma eficiente.
              </p>

              {/* Features Icons */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center space-y-2">
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mx-auto w-fit">
                    <Package className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Produtos</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mx-auto w-fit">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vendas</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="p-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg mx-auto w-fit">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Relatórios</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className={`flex justify-center lg:justify-end transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            <div className="w-full max-w-md">
              {/* Login Card */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8 space-y-6 hover:shadow-3xl transition-all duration-500">
                
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl w-fit mx-auto shadow-lg">
                    <ShoppingCart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Bem-vindo de volta
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Faça login para acessar o painel administrativo
                  </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="seu@email.com"
                      className="h-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Senha
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="h-12 pr-12 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                      <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                    </div>
                  )}

                  {/* Remember Me */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <label 
                      htmlFor="remember" 
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                    >
                      Lembrar de mim
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      'Entrar no Painel'
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sistema de gerenciamento seguro e confiável
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .bg-grid-slate-100 {
          background-image: linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .dark .bg-grid-slate-700\/25 {
          background-image: linear-gradient(rgba(51, 65, 85, 0.25) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(51, 65, 85, 0.25) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Index;
