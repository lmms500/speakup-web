import React, { useEffect, useState } from 'react';
import { AnalysisResult, CoachPersona } from '../types'; // Importei CoachPersona
import { AudioPlayer } from './AudioPlayer';
import { TranscriptionViewer } from './TranscriptionViewer';
import { ShareModal } from './ShareModal';
import { RotateCcw, CheckCircle2, AlertCircle, Sparkles, MicOff, Quote, ChevronDown, ChevronUp, Share2, Smile, Frown, Meh, Zap, Volume2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { storageService } from '../services/storageService'; // Importei storageService

interface ResultsViewProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
  audioBlob?: Blob | null;
  onRetry: () => void;
}

// Configuração de "Emoção" da Voz (Simulação)
const VOICE_SETTINGS: Record<CoachPersona, { rate: number; pitch: number }> = {
  MOTIVATOR: { rate: 1.1, pitch: 1.2 }, // Entusiasta (Rápido + Agudo)
  STRICT: { rate: 0.9, pitch: 0.8 },    // Sério (Lento + Grave)
  FUNNY: { rate: 1.2, pitch: 1.4 },     // Cômico (Muito Rápido + Muito Agudo)
  TECHNICAL: { rate: 1.0, pitch: 1.0 }  // Neutro (Padrão)
};

export const ResultsView: React.FC<ResultsViewProps> = ({ result, isLoading = false, audioBlob, onRetry }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioBlob]);

  // Função de Text-to-Speech com "Personalidade"
  const handleSpeakFeedback = () => {
    if (!result) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // 1. Pega a persona atual do usuário
    const profile = storageService.getUserProfile();
    const persona = profile.persona || 'MOTIVATOR';
    const settings = VOICE_SETTINGS[persona];

    // 2. Prepara o texto
    const textToSpeak = `${result.feedback_positivo}. ${result.ponto_melhoria}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // 3. Configura idioma
    utterance.lang = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US';
    
    // 4. Aplica a "emoção" (velocidade e tom)
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;

    // Tenta selecionar uma voz compatível (opcional, melhora se disponível)
    const voices = window.speechSynthesis.getVoices();
    // Tenta achar uma voz do Google ou Microsoft que soe mais natural para o idioma
    const preferredVoice = voices.find(v => 
      v.lang.startsWith(utterance.lang) && (v.name.includes("Google") || v.name.includes("Natural"))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Cleanup para parar a fala se sair da tela
  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return <Meh size={24} className="text-slate-400" />;
    return <Smile size={24} className="text-brand-mint" />; 
  };

  if (isLoading || !result) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in space-y-6 pb-6 pt-2">
        <div className="text-center space-y-2 mb-8">
           <div className="h-8 w-48 bg-slate-200 dark:bg-white/10 rounded-lg mx-auto animate-pulse"></div>
           <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-lg mx-auto animate-pulse"></div>
        </div>
        <div className="h-40 w-full bg-slate-200 dark:bg-white/5 rounded-[2.5rem] animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
        <div className="space-y-4">
           <div className="h-32 bg-slate-200 dark:bg-white/5 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!result.speech_detected) {
    return (
      <div className="w-full max-w-md mx-auto animate-fade-in space-y-8 pb-6 text-center">
        <div className="pt-10 space-y-6">
          <div className="w-24 h-24 bg-brand-coral/10 dark:bg-brand-coral/20 rounded-full flex items-center justify-center mx-auto text-brand-coral">
             <MicOff size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-brand-charcoal dark:text-dark-text mb-2 transition-colors">{t('res_no_speech')}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium px-4 transition-colors">
              {t('res_no_speech_desc')}
            </p>
          </div>
        </div>
        <div className="pt-4">
          <button onClick={onRetry} className="w-full py-4 rounded-xl font-bold bg-brand-purple text-white shadow-glow-purple hover:bg-brand-purple/90 transition-all">
            {t('btn_retry')}
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-brand-mint dark:text-dark-accent";
    if (score >= 60) return "text-amber-500 dark:text-amber-400";
    return "text-brand-coral";
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in space-y-6 pb-20 text-brand-charcoal dark:text-dark-text relative">
      
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={() => setShowShareModal(true)}
          className="p-2 bg-white dark:bg-white/10 rounded-full shadow-sm hover:scale-110 transition-transform text-brand-purple dark:text-white border border-slate-100 dark:border-white/10"
          title={t('share_btn')}
        >
          <Share2 size={20} />
        </button>
      </div>

      {showShareModal && (
        <ShareModal 
          score={result.score} 
          context={result.context} 
          onClose={() => setShowShareModal(false)} 
        />
      )}
      
      {/* Gráfico de Pontuação */}
      <div className="text-center mt-2 relative">
        <div className="relative inline-flex justify-center items-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-white/5" />
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray={552} 
              strokeDashoffset={552 - (552 * result.score) / 100}
              strokeLinecap="round"
              className={`${getScoreColor(result.score)} transition-all duration-1000 ease-out`} 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-heading font-bold tracking-tighter tabular-nums dark:text-white">{result.score}</span>
            <span className="text-xs font-bold uppercase text-slate-400 tracking-widest mt-1">{t('res_score')}</span>
          </div>
        </div>
      </div>

      {/* Botão TTS */}
      <div className="flex justify-center -mt-2">
        <button 
          onClick={handleSpeakFeedback}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
            isSpeaking 
              ? 'bg-brand-purple text-white animate-pulse' 
              : 'bg-slate-100 dark:bg-white/10 text-brand-purple dark:text-brand-primary hover:bg-slate-200 dark:hover:bg-white/20'
          }`}
        >
          <Volume2 size={16} />
          {isSpeaking ? 'Falando...' : t('tts_speak_feedback')}
        </button>
      </div>

      {audioUrl && (
        <div className="px-1">
          <AudioPlayer audioUrl={audioUrl} />
        </div>
      )}

      <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-soft dark:shadow-none border border-slate-100 dark:border-white/5 transition-colors overflow-hidden">
        <button 
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3 text-brand-purple dark:text-dark-primary">
            <Quote size={20} className="fill-current opacity-50" />
            <h3 className="font-heading font-bold text-brand-charcoal dark:text-dark-text">
              {t('res_transcript')}
            </h3>
          </div>
          {showTranscript ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </button>
        
        {showTranscript && (
          <div className="px-6 pb-6 animate-fade-in border-t border-slate-100 dark:border-white/5">
             <TranscriptionViewer text={result.transcript || "Transcrição indisponível."} />
          </div>
        )}
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('res_metrics_vices')}</div>
          <span className={`text-xl font-bold ${result.vicios_linguagem_count > 0 ? 'text-brand-coral' : 'text-brand-mint'}`}>
            {result.vicios_linguagem_count}
          </span>
        </div>
        
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('res_metrics_speed')}</div>
            <div className="flex flex-col items-center">
                <span className="text-xl font-bold dark:text-white leading-none">{result.wpm || '-'}</span>
                <span className="text-[10px] text-slate-400 font-medium">{t('res_unit_wpm')}</span>
            </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('res_metrics_rhythm')}</div>
          <span className="text-sm font-bold dark:text-white leading-tight">{result.ritmo_analise}</span>
        </div>

        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('res_metrics_tone')}</div>
          <div className="flex flex-col items-center">
             {getSentimentIcon(result.sentiment)}
             <span className="text-xs font-bold mt-1 dark:text-white">{result.sentiment || '-'}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/10">
          <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wide">{t('res_feedback_strong')}</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{result.feedback_positivo}</p>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-900/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-500/10">
          <div className="flex items-center gap-2 mb-3 text-rose-600 dark:text-rose-400">
            <AlertCircle size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wide">{t('res_feedback_improve')}</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{result.ponto_melhoria}</p>
        </div>

        <div className="bg-brand-purple/5 dark:bg-brand-purple/10 p-6 rounded-3xl border border-brand-purple/10 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-brand-purple dark:text-brand-primary relative z-10">
            <Sparkles size={18} />
            <h3 className="font-bold text-sm uppercase tracking-wide">{t('res_feedback_ai')}</h3>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-sm italic relative z-10">"{result.frase_reformulada}"</p>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={onRetry}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-brand-charcoal dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
        >
          <RotateCcw size={18} />
          {t('btn_retry')}
        </button>
      </div>
    </div>
  );
};