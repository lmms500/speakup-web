import React, { useRef, useState } from 'react';
import { X, Download, Share2, Mic } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  score: number;
  context: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ score, context, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // 1. Gera a imagem do card com alta qualidade (scale: 3)
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, 
        backgroundColor: null,
        logging: false,
        useCORS: true, // Importante para carregar fontes/imagens externas se houver
        allowTaint: true
      });

      const image = canvas.toDataURL("image/png");

      // 2. Detecta se o navegador suporta compartilhamento nativo (Mobile)
      if (navigator.share) {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "speakup-result.png", { type: "image/png" });
        
        await navigator.share({
          title: 'Meu resultado no SpeakUp',
          text: `Consegui ${score} pontos treinando minha oratória no SpeakUp! 🚀`,
          files: [file]
        });
      } else {
        // 3. Fallback para Desktop: Baixa a imagem automaticamente
        const link = document.createElement('a');
        link.href = image;
        link.download = 'speakup-score.png';
        link.click();
      }
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      alert("Não foi possível gerar a imagem. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Botão Fechar (Fora da área de captura) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* --- ÁREA CAPTURÁVEL (O que vira imagem) --- */}
        <div ref={cardRef} className="p-8 bg-gradient-to-br from-[#6C63FF] to-[#8B85FF] text-white flex flex-col items-center justify-between aspect-[4/5] relative overflow-hidden">
          
          {/* Decoração de Fundo (Bolhas de luz) */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-pink-500 rounded-full blur-3xl"></div>
          </div>

          {/* Header do Card */}
          <div className="flex items-center gap-2 z-10 opacity-90 mt-4">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md shadow-sm">
              <Mic size={24} className="text-white" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">SpeakUp</span>
          </div>

          {/* Score Central em Destaque */}
          <div className="z-10 text-center">
            <p className="text-white/80 font-medium text-xs uppercase tracking-widest mb-2">Minha Performance</p>
            <div className="text-[8rem] leading-none font-heading font-bold tracking-tighter drop-shadow-xl">
              {score}
            </div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-sm font-bold mt-6 shadow-lg">
              {context}
            </div>
          </div>

          {/* Footer do Card */}
          <div className="z-10 text-center w-full border-t border-white/20 pt-4 mb-2">
            <p className="text-white/90 text-sm font-medium">Treine sua oratória com IA</p>
            <p className="text-white/60 text-xs mt-1">speakup.app</p>
          </div>
        </div>
        {/* --- FIM DA ÁREA CAPTURÁVEL --- */}

        {/* Botão de Ação (Inferior) */}
        <div className="p-5 bg-white dark:bg-[#1E1E1E] border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl font-bold bg-[#6C63FF] text-white shadow-glow-purple hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-wait"
          >
            {isGenerating ? (
              <span className="animate-pulse">Gerando imagem...</span>
            ) : (
              <>
                {/* Mostra ícone diferente dependendo se é mobile ou desktop */}
                {navigator.share ? <Share2 size={20} /> : <Download size={20} />} 
                {navigator.share ? 'Compartilhar Resultado' : 'Baixar Imagem'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};