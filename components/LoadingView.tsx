import React from 'react';

export const LoadingView: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in space-y-8 flex-1 flex flex-col justify-center">
      
      {/* Texto de Status */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-brand-charcoal dark:text-dark-text animate-pulse transition-colors">Processando Áudio</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">A IA está avaliando sua oratória...</p>
      </div>

      {/* Shimmer Cards (Esqueleto) */}
      <div className="space-y-4 w-full opacity-70">
        
        {/* Score Placeholder */}
        <div className="h-40 w-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 rounded-[2.5rem] animate-[shimmer_1.5s_infinite]"></div>

        {/* Stats Grid Placeholder */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 rounded-2xl animate-[shimmer_1.5s_infinite] delay-100"></div>
          <div className="h-24 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 rounded-2xl animate-[shimmer_1.5s_infinite] delay-200"></div>
        </div>

        {/* Text Placeholder */}
        <div className="h-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-white/5 dark:via-white/10 dark:to-white/5 rounded-3xl animate-[shimmer_1.5s_infinite] delay-300"></div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>
    </div>
  );
};