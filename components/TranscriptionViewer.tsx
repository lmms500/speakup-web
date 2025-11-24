import React from 'react';

interface Props {
  text: string;
}

// Lista de vícios comuns (pode ser expandida)
const VICIOS = ['né', 'tipo', 'aí', 'então', 'hum', 'ahn', 'é...', 'tá'];

export const TranscriptionViewer: React.FC<Props> = ({ text }) => {
  if (!text) return null;

  // Separa o texto mantendo a pontuação para não quebrar a leitura
  const parts = text.split(/(\s+)/);

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 mt-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
        Transcrição Analisada
      </h3>
      <p className="text-brand-charcoal dark:text-dark-text leading-relaxed text-lg">
        {parts.map((part, index) => {
          // Limpa pontuação para verificar se é vício
          const cleanWord = part.toLowerCase().replace(/[.,?!]/g, '');
          
          const isVicio = VICIOS.includes(cleanWord);

          if (isVicio) {
            return (
              <span key={index} className="text-brand-coral font-bold border-b-2 border-brand-coral/30 px-0.5 mx-0.5 bg-brand-coral/10 rounded">
                {part}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    </div>
  );
};