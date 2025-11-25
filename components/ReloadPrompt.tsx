import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export const ReloadPrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 animate-slide-up px-4">
      <div className="bg-brand-charcoal dark:bg-dark-surface text-white p-4 rounded-2xl shadow-2xl border border-brand-purple/30 flex items-center gap-4 max-w-md w-full backdrop-blur-md">
        
        <div className="p-2 bg-brand-purple rounded-full animate-spin-slow">
          <RefreshCw size={20} />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm">Atualização Disponível</h3>
          <p className="text-xs text-slate-300">Nova versão do SpeakUp pronta.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateServiceWorker(true)}
            className="px-4 py-2 bg-white text-brand-charcoal rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
          >
            Atualizar
          </button>
          <button
            onClick={close}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};