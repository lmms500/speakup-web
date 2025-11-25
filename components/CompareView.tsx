import React from 'react';
import { AnalysisResult } from '../types';
import { ArrowRight, Trophy, Zap, AlertTriangle, Timer } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext'; // Hook

interface CompareViewProps {
  resultA: AnalysisResult;
  resultB: AnalysisResult;
  onBack: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({ resultA, resultB, onBack }) => {
  const { t } = useLanguage();
  const [oldR, newR] = resultA.timestamp < resultB.timestamp ? [resultA, resultB] : [resultB, resultA];

  const renderComparisonRow = (
    label: string, 
    valA: string | number, 
    valB: string | number, 
    icon: React.ReactNode,
    inverseLogic = false
  ) => {
    let color = 'text-slate-500';
    if (valA !== valB) {
      const improved = inverseLogic ? valB < valA : valB > valA;
      color = improved ? 'text-brand-mint' : 'text-brand-coral';
    }

    return (
      <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-white/5 last:border-0">
        <div className="w-1/3 text-center text-sm font-bold text-slate-400 dark:text-slate-500">{valA}</div>
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className={`p-2 rounded-full bg-slate-50 dark:bg-white/5 mb-1 text-brand-charcoal dark:text-white`}>{icon}</div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</span>
        </div>
        <div className={`w-1/3 text-center text-sm font-bold ${color}`}>{valB}</div>
      </div>
    );
  };

  // Lógica de Veredito traduzida
  const getVerdict = () => {
    const diff = Math.abs(newR.score - oldR.score);
    if (newR.score > oldR.score) return t('comp_improved', { diff });
    if (newR.score < oldR.score) return t('comp_declined', { diff });
    return t('comp_consistent');
  };

  return (
    <div className="w-full max-w-md animate-fade-in pb-8">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <svg className="w-6 h-6 text-brand-charcoal dark:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-heading font-bold text-brand-charcoal dark:text-dark-text ml-2">{t('comp_title')}</h2>
      </div>

      <div className="flex justify-between items-center gap-2 mb-6">
        <div className="flex-1 bg-white dark:bg-dark-surface p-3 rounded-2xl text-center shadow-sm border border-slate-100 dark:border-white/5 opacity-70">
          <p className="text-[10px] uppercase font-bold text-slate-400">{t('comp_before')}</p>
          <p className="text-xs font-bold text-brand-charcoal dark:text-white mt-1">
            {new Date(oldR.timestamp).toLocaleDateString(undefined, { day:'2-digit', month:'short' })}
          </p>
        </div>
        <ArrowRight className="text-slate-300" size={20} />
        <div className="flex-1 bg-white dark:bg-dark-surface p-3 rounded-2xl text-center shadow-glow-purple border border-brand-purple/20">
          <p className="text-[10px] uppercase font-bold text-brand-purple">{t('comp_after')}</p>
          <p className="text-xs font-bold text-brand-charcoal dark:text-white mt-1">
            {new Date(newR.timestamp).toLocaleDateString(undefined, { day:'2-digit', month:'short' })}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-white/5 px-4">
        {renderComparisonRow(t('res_score'), oldR.score, newR.score, <Trophy size={16} />)}
        {renderComparisonRow(t('res_metrics_vices'), oldR.vicios_linguagem_count, newR.vicios_linguagem_count, <AlertTriangle size={16} />, true)}
        {renderComparisonRow(t('res_unit_wpm'), oldR.wpm || 0, newR.wpm || 0, <Zap size={16} />)}
        
        <div className="flex items-center justify-between py-4">
           <div className="w-1/3 text-center text-xs font-medium text-slate-400 truncate px-1">{oldR.ritmo_analise}</div>
           <div className="flex flex-col items-center w-1/3">
              <div className="p-2 rounded-full bg-slate-50 dark:bg-white/5 mb-1 text-brand-charcoal dark:text-white"><Timer size={16} /></div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t('res_metrics_rhythm')}</span>
           </div>
           <div className="w-1/3 text-center text-xs font-medium text-slate-400 truncate px-1">{newR.ritmo_analise}</div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-gradient-to-br from-brand-purple/10 to-indigo-500/10 rounded-2xl border border-brand-purple/10 text-center">
        <h3 className="text-sm font-bold text-brand-purple dark:text-brand-primary uppercase tracking-wide mb-2">{t('comp_verdict')}</h3>
        <p className="text-brand-charcoal dark:text-slate-200 text-sm leading-relaxed">{getVerdict()}</p>
      </div>
    </div>
  );
};