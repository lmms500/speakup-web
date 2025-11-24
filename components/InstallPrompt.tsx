import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';

export const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Verifica se já está instalado (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    if (isStandalone) return; // Se já é app, não mostra nada.

    // 2. Detecta se é iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Configura o gatilho para Android/Desktop (Chrome)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // Impede o banner padrão feio do Chrome
      setDeferredPrompt(e);
      setShowPrompt(true); // Mostra o nosso banner bonito
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Para iOS, mostramos logo de cara (ou após um delay)
    if (isIosDevice) {
      setTimeout(() => setShowPrompt(true), 3000); // Espera 3s para não assustar
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-brand-charcoal/95 dark:bg-dark-surface/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-brand-purple/30 flex flex-col gap-4">
        
        {/* Cabeçalho com botão fechar */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center shadow-glow-purple">
              <Download size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Instalar SpeakUp</h3>
              <p className="text-slate-300 text-xs mt-0.5">Acesso rápido e tela cheia</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPrompt(false)} 
            className="p-1 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo Dinâmico (Android vs iOS) */}
        {isIOS ? (
          <div className="bg-white/5 rounded-xl p-3 text-sm text-slate-200 space-y-2 border border-white/5">
            <p className="flex items-center gap-2">
              1. Toque no botão <Share size={16} className="text-blue-400" /> <strong>Compartilhar</strong>
            </p>
            <p className="flex items-center gap-2">
              2. Selecione <PlusSquare size={16} className="text-brand-charcoal dark:text-white" /> <strong>Adicionar à Tela de Início</strong>
            </p>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full py-3 rounded-xl font-bold bg-brand-purple text-white shadow-glow-purple hover:bg-brand-purple/90 transition-all active:scale-95"
          >
            Instalar Aplicativo
          </button>
        )}
      </div>
    </div>
  );
};