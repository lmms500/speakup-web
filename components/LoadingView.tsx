import React, { useState, useEffect } from 'react';

// Lista de mensagens para manter o usuário engajado
const MESSAGES = [
  "Enviando áudio...",
  "Transcrevendo sua fala...",
  "Analisando entonação e ritmo...",
  "Caçando vícios de linguagem...",
  "Gerando feedback personalizado...",
  "Quase pronto..."
];

export const LoadingView: React.FC = () => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Troca a mensagem a cada 2 segundos
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in space-y-8 flex-1 flex flex-col justify-center items-center p-6">
      
      {/* Animação Central (Spinner customizado) */}
      <div className="relative">
        {/* Círculo de fundo */}
        <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-white/10"></div>
        {/* Círculo giratório colorido */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-[#6C63FF] border-t-transparent animate-spin"></div>
        {/* Ícone central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl animate-pulse">
          🤖
        </div>
      </div>

      {/* Texto Dinâmico */}
      <div className="text-center space-y-2 h-16">
        <h2 className="text-xl font-heading font-bold text-brand-charcoal dark:text-white animate-pulse transition-all duration-500">
          {MESSAGES[msgIndex]}
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Isso pode levar alguns segundos
        </p>
      </div>

      {/* Shimmer Effect Decorativo (Barrinhas carregando embaixo) */}
      <div className="w-full max-w-xs space-y-3 opacity-30">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 mx-auto animate-pulse"></div>
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2 mx-auto animate-pulse delay-75"></div>
      </div>
    </div>
  );
};