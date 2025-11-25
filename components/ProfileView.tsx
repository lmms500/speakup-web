import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, Badge, CoachPersona, Language } from '../types';
import { storageService } from '../services/storageService';
import { Trophy, Zap, Award, Download, Upload, Globe } from 'lucide-react';
import { PersonaSelector } from './PersonaSelector';
import { useLanguage } from '../context/LanguageContext'; // [NOVO]

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language, setLanguage } = useLanguage(); // [NOVO] Hook de tradução

  useEffect(() => {
    setProfile(storageService.getUserProfile());
    setAllBadges(storageService.getAllBadges());
  }, []);

  const handlePersonaChange = (newPersona: CoachPersona) => {
    if (profile) {
      const updated = { ...profile, persona: newPersona };
      setProfile(updated);
      storageService.updatePersona(newPersona);
    }
  };

  // Handler para mudar idioma
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (profile) setProfile({ ...profile, language: lang });
  };

  const handleExport = () => {
    const data = storageService.createBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speakup_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (mantenha a lógica de importação igual)
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm("Substituir histórico atual?")) return;
    try {
      const text = await file.text();
      if (await storageService.restoreBackup(text)) window.location.reload();
    } catch {}
  };

  if (!profile) return null;

  const currentLevelXp = Math.pow((profile.level - 1) * 5, 2);
  const nextLevelXp = Math.pow((profile.level) * 5, 2);
  const progress = ((profile.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <div className="w-full max-w-md animate-fade-in px-4 pt-4 pb-24 space-y-8">
      
      {/* Card de Nível */}
      <div className="bg-gradient-to-br from-brand-purple to-indigo-600 rounded-3xl p-6 text-white shadow-glow-purple relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Trophy size={80} /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">{profile.level}</div>
            <div>
              <h2 className="text-lg font-bold opacity-90">{t('prof_level')}</h2>
              <p className="text-xs opacity-70">XP {profile.totalXp}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium mb-1 opacity-80">
              <span>{Math.round(progress)}%</span>
              <span>{t('prof_next')}: {nextLevelXp}</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div className="h-full bg-brand-mint transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* [NOVO] Seletor de Idioma */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2 mb-3 text-brand-charcoal dark:text-white">
          <Globe size={18} className="text-brand-purple" />
          <h3 className="font-bold text-sm">{t('prof_lang')}</h3>
        </div>
        <div className="flex gap-2">
          {(['pt', 'en', 'es'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                language === lang 
                  ? 'bg-brand-purple text-white shadow-glow-purple' 
                  : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <PersonaSelector current={profile.persona} onSelect={handlePersonaChange} />

      {/* Backup */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-white mb-4 px-2">{t('prof_data')}</h3>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10">
            <Download size={18} /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10">
            <Upload size={18} /> Import
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
      </div>
    </div>
  );
};