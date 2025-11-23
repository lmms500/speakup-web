import React, { useEffect, useState } from 'react';
import { AnalysisResult } from '../types';
import { Button } from './Button';
import { audioStorage } from '../services/audioStorage';
import { AudioPlayer } from './AudioPlayer';

interface HistoryDetailViewProps {
  result: AnalysisResult;
  onBack: () => void;
}

export const HistoryDetailView: React.FC<HistoryDetailViewProps> = ({ result, onBack }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAudio = async () => {
      if (result.audioId) {
        try {
          const blob = await audioStorage.getAudio(result.audioId);
          if (blob) {
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
          }
        } catch (e) {
          console.error("Error loading audio", e);
        }
      }
    };
    loadAudio();

    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [result.id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-mint dark:text-dark-accent";
    if (score >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-brand-coral";
  };

  return (
    <div className="w-full max-w-md animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <svg className="w-6 h-6 text-brand-charcoal dark:text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-heading font-bold text-brand-charcoal dark:text-dark-text ml-2">Análise Detalhada</h2>
      </div>

      <div className="space-y-6">
        {/* Score Big */}
        <div className="text-center py-6 bg-white dark:bg-dark-surface rounded-3xl shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-white/5">
          <div className={`text-6xl font-heading font-bold tracking-tighter ${getScoreColor(result.score)}`}>
            {result.score}
          </div>
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Nota Final</div>
          <div className="mt-2 text-sm font-medium text-brand-charcoal dark:text-dark-text">{result.context}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(result.timestamp).toLocaleString('pt-BR')}
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl ? (
          <div className="bg-brand-purple dark:bg-dark-primary p-6 rounded-2xl shadow-glow-purple text-white">
            <h3 className="text-sm font-bold uppercase tracking-wider opacity-80 mb-3">Ouvir Gravação</h3>
            <div className="bg-white/10 rounded-xl p-1">
               <AudioPlayer audioUrl={audioUrl} />
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-xl text-center text-slate-500 text-sm">
            Áudio não disponível
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Ritmo</div>
             <div className="text-lg font-bold text-brand-charcoal dark:text-dark-text">{result.ritmo_analise}</div>
          </div>
          <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Vícios</div>
             <div className="text-lg font-bold text-brand-charcoal dark:text-dark-text">{result.vicios_linguagem_count} <span className="text-xs font-normal text-slate-400">detectados</span></div>
          </div>
        </div>

        {/* Feedback Sections */}
        <div className="space-y-4">
           <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm dark:shadow-dark-soft">
             <h3 className="font-heading font-bold text-brand-mint dark:text-dark-accent mb-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-mint dark:bg-dark-accent"></span>
               Feedback Positivo
             </h3>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.feedback_positivo}</p>
           </div>

           <div className="bg-white dark:bg-dark-surface p-5 rounded-2xl shadow-sm dark:shadow-dark-soft">
             <h3 className="font-heading font-bold text-brand-coral mb-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-brand-coral"></span>
               Ponto de Melhoria
             </h3>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{result.ponto_melhoria}</p>
           </div>

           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-white/5 dark:to-white/10 p-5 rounded-2xl border border-indigo-100 dark:border-white/5">
             <h3 className="font-heading font-bold text-brand-purple dark:text-dark-primary mb-2 flex items-center gap-2">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9.5 3A6.5 6.5 0 0116 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 019.5 16 6.5 6.5 0 013 9.5 6.5 6.5 0 019.5 3m0 1C6.48 4 4.02 6.48 4.02 9.5S6.48 15 9.5 15 15 12.52 15 9.5 12.52 4 9.5 4z"></path></svg>
               Sugestão de Reformulação
             </h3>
             <p className="text-slate-700 dark:text-slate-200 text-sm italic">"{result.frase_reformulada}"</p>
           </div>
        </div>
      </div>
    </div>
  );
};