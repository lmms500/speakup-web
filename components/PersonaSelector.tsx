import React from 'react';
import { CoachPersona } from '../types';
import { Sparkles, Gavel, Laugh, Cpu, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PersonaSelectorProps {
  current: CoachPersona;
  onSelect: (persona: CoachPersona) => void;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ current, onSelect }) => {
  const { t } = useLanguage();

  const PERSONAS: { id: CoachPersona; name: string; desc: string; icon: React.ReactNode, color: string }[] = [
    { 
      id: 'MOTIVATOR', 
      name: t('p_motivator_name'), 
      desc: t('p_motivator_desc'), 
      icon: <Sparkles size={24} />,
      color: 'bg-yellow-400'
    },
    { 
      id: 'STRICT', 
      name: t('p_strict_name'), 
      desc: t('p_strict_desc'), 
      icon: <Gavel size={24} />,
      color: 'bg-red-500'
    },
    { 
      id: 'FUNNY', 
      name: t('p_funny_name'), 
      desc: t('p_funny_desc'), 
      icon: <Laugh size={24} />,
      color: 'bg-pink-500'
    },
    { 
      id: 'TECHNICAL', 
      name: t('p_technical_name'), 
      desc: t('p_technical_desc'), 
      icon: <Cpu size={24} />,
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-brand-charcoal dark:text-white px-2">{t('prof_persona')}</h3>
      <div className="grid grid-cols-2 gap-3">
        {PERSONAS.map((p) => {
          const isSelected = current === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2
                ${isSelected 
                  ? 'border-brand-purple bg-brand-purple/5 dark:bg-brand-purple/20' 
                  : 'border-transparent bg-white dark:bg-dark-surface hover:bg-slate-50 dark:hover:bg-white/5'}
              `}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-brand-purple rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${p.color}`}>
                {p.icon}
              </div>
              
              <div>
                <div className={`font-heading font-bold text-sm ${isSelected ? 'text-brand-purple dark:text-brand-primary' : 'text-brand-charcoal dark:text-white'}`}>
                  {p.name}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                  {p.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};