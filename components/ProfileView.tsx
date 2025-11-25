import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, Badge, CoachPersona } from '../types';
import { storageService } from '../services/storageService';
import { Trophy, Zap, Award, Download, Upload, FileJson } from 'lucide-react';
import { PersonaSelector } from './PersonaSelector';

export const ProfileView: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // [NOVO] Handler de Exportação
  const handleExport = () => {
    const data = storageService.createBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `speakup_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // [NOVO] Handler de Importação
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Atenção: Isso irá substituir o seu histórico atual pelos dados do backup. Deseja continuar?")) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const text = await file.text();
      const success = await storageService.restoreBackup(text);
      
      if (success) {
        alert('Backup restaurado com sucesso! O app será recarregado.');
        window.location.reload();
      } else {
        alert('Erro ao restaurar backup. Verifique se o arquivo é válido.');
      }
    } catch (error) {
      alert('Erro ao ler arquivo.');
    }
  };

  if (!profile) return null;

  const currentLevelXp = Math.pow((profile.level - 1) * 5, 2);
  const nextLevelXp = Math.pow((profile.level) * 5, 2);
  const progress = ((profile.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return (
    <div className="w-full max-w-md animate-fade-in px-4 pt-4 pb-24 space-y-8">
      
      {/* Card Principal de Nível */}
      <div className="bg-gradient-to-br from-brand-purple to-indigo-600 rounded-3xl p-6 text-white shadow-glow-purple relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Trophy size={80} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {profile.level}
            </div>
            <div>
              <h2 className="text-lg font-bold opacity-90">Seu Nível</h2>
              <p className="text-xs opacity-70">Continue treinando para subir!</p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-xs font-medium mb-1 opacity-80">
              <span>XP {profile.totalXp}</span>
              <span>Próximo: {nextLevelXp}</span>
            </div>
            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-brand-mint shadow-[0_0_10px_rgba(0,200,150,0.5)] transition-all duration-1000"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-500 rounded-xl">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-charcoal dark:text-white">{profile.streak}</div>
            <div className="text-xs text-slate-400 uppercase font-bold">Dias Seguidos</div>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-charcoal dark:text-white">{profile.badges.length}</div>
            <div className="text-xs text-slate-400 uppercase font-bold">Medalhas</div>
          </div>
        </div>
      </div>

      {/* Seletor de Persona */}
      <PersonaSelector current={profile.persona} onSelect={handlePersonaChange} />

      {/* Lista de Medalhas */}
      <div>
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-white mb-4 px-2">Suas Conquistas</h3>
        <div className="grid grid-cols-2 gap-3">
          {allBadges.map(badge => {
            const isUnlocked = profile.badges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                  isUnlocked 
                    ? 'bg-white dark:bg-dark-surface border-brand-mint/30 shadow-sm' 
                    : 'bg-slate-50 dark:bg-white/5 border-transparent opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <h4 className="font-bold text-sm text-brand-charcoal dark:text-white">{badge.name}</h4>
                <p className="text-xs text-slate-400">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* [NOVO] Área de Backup */}
      <div className="pt-4 border-t border-slate-100 dark:border-white/5">
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-white mb-4 px-2">Dados e Backup</h3>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <Download size={18} />
            Salvar Dados
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-100 dark:bg-white/5 text-brand-charcoal dark:text-white rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <Upload size={18} />
            Restaurar
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            className="hidden" 
          />
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-3 px-4">
          O backup inclui seu histórico e perfil. Áudios gravados não são exportados para manter o arquivo leve.
        </p>
      </div>
    </div>
  );
};