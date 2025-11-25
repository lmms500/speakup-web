import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';
import { storageService } from '../services/storageService';
import { Chart } from './Chart';
import { Trash2 } from 'lucide-react';

interface HistoryViewProps {
  onSelectDetail: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectDetail }) => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setHistory(storageService.getHistory());
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Tem certeza que deseja excluir este treino?")) {
      await storageService.deleteById(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
        <div className="w-16 h-16 bg-slate-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-4 transition-colors">
          <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-dark-text transition-colors">Sem histórico</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">Seus treinos aparecerão aqui.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in flex-1 overflow-y-auto pb-24 px-4 pt-2">
      <Chart data={history} />
      
      <h2 className="text-xl font-heading font-bold text-brand-charcoal dark:text-dark-text mb-4 px-2 transition-colors">Histórico de Treinos</h2>
      
      <div className="space-y-4">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectDetail(item.id)}
            className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-white/5 flex items-center gap-4 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group relative pr-12"
          >
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 flex-shrink-0 transition-colors
              ${item.score >= 80 
                ? 'border-brand-mint text-brand-mint bg-emerald-50 dark:bg-emerald-900/20' 
                : item.score >= 60 
                  ? 'border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                  : 'border-brand-coral text-brand-coral bg-rose-50 dark:bg-rose-900/20'}
            `}>
              {item.score}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-brand-charcoal dark:text-dark-text text-sm truncate transition-colors">{item.context}</h4>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">
                    {new Date(item.timestamp).toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                    })}
                 </p>
                 {item.wpm && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500" title="Palavras por minuto">
                        {item.wpm} pal/min
                    </span>
                 )}
              </div>
            </div>

            <button 
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
                <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};