import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

interface InstallPwaPopupProps {
  onInstall: () => void;
  onDismiss: () => void;
}

export const InstallPwaPopup = ({ onInstall, onDismiss }: InstallPwaPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Animar entrada
    setIsVisible(true);
    
    // Detectar iOS
    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleInstall = () => {
    setIsVisible(false);
    setTimeout(onInstall, 150);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Popup Principal */}
      <div 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] w-[95%] max-w-md transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Instalar LECULGO</h3>
                <p className="text-blue-100 text-sm">Acesse rapidamente suas vendas</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Acesso instantâneo
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Abra direto da tela inicial
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Funciona offline
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Consulte dados mesmo sem internet
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Experiência nativa
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Interface otimizada para mobile
                  </p>
                </div>
              </div>
            </div>

            {/* Instruções específicas para iOS */}
            {isIOS && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Para instalar no iOS:</strong> Toque no botão compartilhar 
                  <span className="inline-block mx-1">⬆️</span> 
                  e depois em "Adicionar à Tela de Início"
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="flex-1 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600"
              >
                Agora não
              </Button>
              
              {!isIOS ? (
                <Button 
                  onClick={handleInstall}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar App
                </Button>
              ) : (
                <Button 
                  onClick={handleDismiss}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  Entendi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};