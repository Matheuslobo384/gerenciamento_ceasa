import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
  prompt(): Promise<void>;
}

export const useInstallPrompt = () => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      
      // Aguardar um pouco antes de mostrar o popup para melhor UX
      setTimeout(() => {
        setShowInstallPopup(true);
      }, 2000);
    };

    const handleAppInstalled = () => {
      console.log('PWA foi instalado com sucesso');
      setPromptEvent(null);
      setShowInstallPopup(false);
      setIsInstallable(false);
    };

    // Detectar se já está em modo standalone (PWA instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');

    // Detectar iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    // Mostrar popup para iOS se não estiver em modo standalone
    if (isIOS && !isInStandaloneMode && !isStandalone) {
      setTimeout(() => {
        setShowInstallPopup(true);
        setIsInstallable(true);
      }, 3000);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = () => {
    if (!promptEvent) return;

    promptEvent.prompt();
    promptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou instalar o PWA');
      } else {
        console.log('Usuário recusou instalar o PWA');
      }
      setPromptEvent(null);
      setShowInstallPopup(false);
      setIsInstallable(false);
    });
  };

  const dismissInstallPrompt = () => {
    setShowInstallPopup(false);
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  return { 
    promptEvent, 
    promptToInstall,
    deferredPrompt: promptEvent,
    showInstallPopup,
    setShowInstallPopup,
    isInstallable,
    dismissInstallPrompt
  };
};