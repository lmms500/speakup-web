import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, X, Mic, Sparkles, Settings } from 'lucide-react';
import { Language } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { t, language, setLanguage } = useLanguage();

  const steps = [
    {
      icon: <span className="text-4xl">👋</span>,
      title: t('onb_welcome_title'),
      desc: t('onb_welcome_desc'),
      bg: 'bg-brand-purple'
    },
    {
      icon: <Mic size={48} className="text-white" />,
      title: t('onb_rec_title'),
      desc: t('onb_rec_desc'),
      bg: 'bg-brand-mint'
    },
    {
      icon: <Settings size={48} className="text-white" />,
      title: t('onb_persona_title'),
      desc: t('onb_persona_desc'),
      bg: 'bg-brand-coral'
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('speakup_onboarding_seen', 'true');
      onComplete();
    }
  };

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4">
      <div className="w-full max-w-sm bg-white dark:bg-[#1E1E1E] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col relative">
        
        {/* [NOVO] Seletor de Idioma Rápido */}
        <div className="absolute top-4 left-4 z-30 flex gap-1 bg-black/20 backdrop-blur-md p-1 rounded-lg">
          {(['pt', 'en', 'es'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all uppercase ${
                language === lang
                  ? 'bg-white text-brand-charcoal shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Botão Fechar */}
        <button 
          onClick={() => { localStorage.setItem('speakup_onboarding_seen', 'true'); onComplete(); }}
          className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-20 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Image Area */}
        <div className={`h-64 ${current.bg} flex items-center justify-center relative transition-colors duration-500`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 animate-in zoom-in duration-300" key={step}>
            {current.icon}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col text-center">
          <h2 className="text-2xl font-heading font-bold text-brand-charcoal dark:text-white mb-3 transition-all animate-fade-in" key={`t-${language}-${step}`}>
            {current.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-300 text-sm leading-relaxed mb-8 transition-all animate-fade-in" key={`d-${language}-${step}`}>
            {current.desc}
          </p>

          <div className="mt-auto space-y-6">
            {/* Dots Indicator */}
            <div className="flex justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 rounded-full transition-all duration-300 ${i === step ? `w-6 ${current.bg.replace('bg-', 'bg-')}` : 'w-2 bg-slate-200 dark:bg-white/10'}`}
                  style={{ backgroundColor: i === step ? undefined : '' }}
                ></div>
              ))}
            </div>

            {/* Action Button */}
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${current.bg}`}
            >
              {step === steps.length - 1 ? t('onb_btn_start') : t('onb_btn_next')} 
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};