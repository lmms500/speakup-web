import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, TranslationKey } from '../i18n/translations';
import { storageService } from '../services/storageService';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Atualizado para aceitar parâmetros
  t: (key: TranslationKey, params?: Record<string, string | number>) => string; 
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const profile = storageService.getUserProfile();
    if (profile.language) {
      setLanguageState(profile.language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    storageService.updateLanguage(lang);
  };

  // Função t melhorada com suporte a parâmetros {param}
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = TRANSLATIONS[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};