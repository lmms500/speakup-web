import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';
import { Button } from './Button';
import { AudioPlayer } from './AudioPlayer';

interface ResultsViewProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
  audioBlob?: Blob | null;
  onRetry: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, isLoading = false, audioBlob, onRetry }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // --- SKELETON LOADING STATE ---
  if (isLoading || !result) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in space-y-6 pb-6 pt-2">
        <div className="text-center space-y-2 mb-8">
           <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-lg mx-auto animate-pulse"></div>
           <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-lg mx-auto animate-pulse"></div>
        </div>

        {/* Score Skeleton */}
        <div className="h-40 w-full bg-slate-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
        </div>

        {/* Text Cards Skeleton */}
        <div className="space-y-4">
           <div className="h-32 bg-slate-200 dark:bg-white/5 rounded-3xl animate-pulse"></div>
           <div className="h-32 bg-slate-200 dark:bg-white/5 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- ERROR STATE (NO SPEECH) ---
  if (!result.speech_detected) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in space-y-8 pb-6 text-center">
        <div className="pt-10 space-y-6">
          <div className="w-24 h-24 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto text-brand-coral">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v.01M12 14v.01" />
             </svg>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-brand-charcoal dark:text-dark-text mb-2 transition-colors">Não ouvimos nada</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium px-4 transition-colors">
              Parece que o áudio está vazio ou muito baixo. Verifique seu microfone e tente falar um pouco mais alto.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <Button onClick={onRetry} fullWidth variant="primary" className="h-14 shadow-glow-purple">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // --- SUCCESS STATE ---
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-mint dark:text-dark-accent border-brand-mint dark:border-dark-accent bg-emerald-50/30 dark:bg-emerald-900/10 ring-brand-mint/20 dark:ring-dark-accent/20";
    if (score >= 60) return "text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/10 ring-amber-200/50 dark:ring-amber-500/20";
    return "text-brand-coral border-brand-coral bg-rose-50/30 dark:bg-rose-900/10 ring-brand-coral/20";
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in space-y-6 pb-6 text-brand-charcoal dark:text-dark-text">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-heading font-bold">Resultado da Análise</h2>
        <p className="text-slate-400 font-medium text-sm">Confira sua performance</p>
      </div>

      {/* Audio Player Integration */}
      {audioUrl && (
        <div className="mb-4">
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      )}

      {/* Main Score Card */}
      <div className={`relative flex flex-col items-center justify-center p-10 rounded-[2.5rem] border ring-4 ring-offset-4 ring-offset-brand-offwhite dark:ring-offset-dark-bg ${getScoreColor(result.score)} transition-all bg-white dark:bg-dark-surface shadow-soft dark:shadow-dark-soft`}>
        <span className="text-7xl font-heading font-bold tracking-tighter tabular-nums">{result.score}</span>
        <span className="text-xs font-bold uppercase tracking-widest mt-2 opacity-60">Nota Geral</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-soft dark:shadow-dark-soft transition-colors">
          <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Vícios de Fala</div>
          <div className="flex items-baseline gap-1.5">
            <div className={`text-3xl font-heading font-bold ${result.vicios_linguagem_count > 0 ? 'text-brand-coral' : 'text-brand-mint dark:text-dark-accent'}`}>
              {result.vicios_linguagem_count}
            </div>
            <div className="text-xs font-medium text-slate-400 dark:text-slate-500">detectados</div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-soft dark:shadow-dark-soft transition-colors">
          <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Ritmo</div>
          <div className="text-lg font-bold text-brand-charcoal dark:text-dark-text flex items-center h-9">{result.ritmo_analise}</div>
        </div>
      </div>

      {/* Analysis Cards */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-soft dark:shadow-dark-soft transition-colors">
          <div className="flex items-center gap-3 mb-3 text-brand-mint dark:text-dark-accent">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-brand-charcoal dark:text-dark-text">Ponto Forte</h3>
          </div>
          <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed pl-1">{result.feedback_positivo}</p>
        </div>

        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-soft dark:shadow-dark-soft transition-colors">
          <div className="flex items-center gap-3 mb-3 text-brand-coral">
             <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold text-brand-charcoal dark:text-dark-text">Para Melhorar</h3>
          </div>
          <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed pl-1">{result.ponto_melhoria}</p>
        </div>

        <div className="bg-gradient-to-br from-brand-purple to-indigo-600 dark:from-dark-primary dark:to-indigo-800 p-6 rounded-3xl shadow-glow-purple text-white relative overflow-hidden transition-all">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
          
          <div className="flex items-center gap-3 mb-4 text-white/90 relative z-10">
             <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="font-heading font-bold">Reformulação Sugerida</h3>
          </div>
          <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
            <p className="text-white text-sm italic font-medium leading-relaxed">"{result.frase_reformulada}"</p>
          </div>
        </div>
      </div>

      <div className="pt-4 pb-8">
        <Button onClick={onRetry} fullWidth variant="secondary" className="h-14 border-0 bg-white dark:bg-dark-surface shadow-soft text-brand-charcoal dark:text-dark-text hover:bg-slate-50 dark:hover:bg-white/10">
          Praticar Novamente
        </Button>
      </div>
    </div>
  );
};