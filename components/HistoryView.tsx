import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';
import { storageService } from '../services/storageService';
import { Chart } from './Chart';
import { Trash2, Check, ArrowRightLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Hook

interface HistoryViewProps {
  onSelectDetail: (id: string) => void;
  onCompare: (id1: string, id2: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectDetail, onCompare }) => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { t } = useLanguage(); // Hook

  useEffect(() => {
    setHistory(storageService.getHistory());
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t('hist_delete_confirm'))) {
      await storageService.deleteById(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleItemClick = (id: string) => {
    if (isSelectionMode) {
      if (selectedIds.includes(id)) {
        setSelectedIds(prev => prev.filter(i => i !== id));
      } else if (selectedIds.length < 2) {
        setSelectedIds(prev => [...prev, id]);
      }
    } else {
      onSelectDetail(id);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  };

  const executeComparison = () => {
    if (selectedIds.length === 2) {
      onCompare(selectedIds[0], selectedIds[1]);
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
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-dark-text transition-colors">{t('hist_empty_title')}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 transition-colors">{t('hist_empty_desc')}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md animate-fade-in flex-1 overflow-y-auto pb-24 px-4 pt-2 relative">
      
      {isSelectionMode && selectedIds.length === 2 && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 animate-in slide-in-from-bottom-4">
          <button 
            onClick={executeComparison}
            className="bg-brand-purple text-white font-bold py-3 px-8 rounded-full shadow-glow-purple flex items-center gap-2 hover:scale-105 transition-transform"
          >
            {t('hist_btn_compare_now')} <ArrowRightLeft size={18} />
          </button>
        </div>
      )}

      {!isSelectionMode && <Chart data={history} />}
      
      <div className="flex items-center justify-between mb-4 px-2 mt-2">
        <h2 className="text-xl font-heading font-bold text-brand-charcoal dark:text-dark-text transition-colors">
          {isSelectionMode ? t('hist_select_compare') : t('hist_title')}
        </h2>
        <button 
          onClick={toggleSelectionMode}
          className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors
            ${isSelectionMode ? 'bg-slate-200 dark:bg-white/10 text-brand-charcoal dark:text-white' : 'text-brand-purple dark:text-brand-primary hover:bg-brand-purple/5'}
          `}
        >
          {isSelectionMode ? t('hist_btn_cancel') : t('hist_btn_compare')}
        </button>
      </div>
      
      <div className="space-y-4">
        {history.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item.id)}
              className={`
                relative p-5 rounded-2xl transition-all cursor-pointer group flex items-center gap-4 border
                ${isSelected 
                  ? 'bg-brand-purple/5 dark:bg-brand-purple/10 border-brand-purple ring-1 ring-brand-purple' 
                  : 'bg-white dark:bg-dark-surface border-slate-100 dark:border-white/5 shadow-soft hover:shadow-md'}
              `}
            >
              {isSelectionMode && (
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                  ${isSelected ? 'bg-brand-purple border-brand-purple' : 'border-slate-300 dark:border-white/20'}
                `}>
                  {isSelected && <Check size={14} className="text-white" />}
                </div>
              )}

              {!isSelectionMode && (
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
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-brand-charcoal dark:text-dark-text text-sm truncate transition-colors">{item.context}</h4>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { // undefined usa locale do browser ou poderíamos passar o 'language'
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                      })}
                   </p>
                   {!isSelectionMode && item.wpm && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded text-slate-500">
                          {item.wpm} {t('res_unit_wpm')}
                      </span>
                   )}
                </div>
              </div>

              {!isSelectionMode && (
                <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                    <Trash2 size={18} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};