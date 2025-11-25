import { AnalysisResult, UserProfile, Badge, CoachPersona, Language } from "../types";
import { audioStorage } from "./audioStorage";

const STORAGE_KEY = 'speakup_history_v1';
const PROFILE_KEY = 'speakup_profile_v1';

const BADGES: Badge[] = [
  // ... (mantenha a lista de badges igual)
  {
    id: 'first_voice',
    name: 'Primeira Voz',
    description: 'Completou o primeiro treino',
    icon: '🎙️',
    condition: (_, history) => history.length >= 1
  },
  // ... outros badges ...
];

export const storageService = {
  _getProfile: (): UserProfile => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
    
    return {
      totalXp: 0,
      level: 1,
      streak: 0,
      lastTrainingDate: null,
      badges: [],
      persona: 'MOTIVATOR',
      language: 'pt' // [NOVO] Padrão
    };
  },

  _saveProfile: (profile: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  updatePersona: (persona: CoachPersona) => {
    const profile = storageService._getProfile();
    profile.persona = persona;
    storageService._saveProfile(profile);
  },

  // [NOVO]
  updateLanguage: (language: Language) => {
    const profile = storageService._getProfile();
    profile.language = language;
    storageService._saveProfile(profile);
  },

  // ... (mantenha saveResult, getHistory, getById, deleteById, createBackup, restoreBackup iguais) ...
  
  // APENAS PARA CONTEXTO, NÃO COPIAR TUDO SE NÃO QUISER, 
  // MAS GARANTA QUE getProfile retorne language no default
  
  createBackup: (): string => {
    const profile = storageService._getProfile();
    const history = storageService.getHistory();
    return JSON.stringify({ version: 1, timestamp: Date.now(), appName: 'SpeakUp', profile, history }, null, 2);
  },

  restoreBackup: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.profile || !data.history || data.appName !== 'SpeakUp') return false;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.history));
      return true;
    } catch { return false; }
  },

  getUserProfile: (): UserProfile => storageService._getProfile(),
  getAllBadges: (): Badge[] => BADGES,
  getStreak: (): number => storageService._getProfile().streak,
  
  // Mantenha os métodos de DB (audioStorage) e outros auxiliares...
  saveResult: async (result: AnalysisResult, audioBlob?: Blob): Promise<{ newBadges: Badge[] }> => {
      try {
        if (audioBlob) {
          await audioStorage.saveAudio(result.id, audioBlob);
          result.audioId = result.id;
        }
        const currentHistory = storageService.getHistory();
        const newHistory = [result, ...currentHistory];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  
        const profile = storageService._getProfile();
        const today = new Date().toDateString();
        const lastDate = profile.lastTrainingDate ? new Date(profile.lastTrainingDate).toDateString() : null;
  
        if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toDateString()) {
            profile.streak += 1;
          } else {
            profile.streak = 1;
          }
          profile.lastTrainingDate = new Date().toISOString();
        }
  
        const xpGained = 100 + result.score;
        profile.totalXp += xpGained;
        const newLevel = Math.floor(Math.sqrt(profile.totalXp) / 5) + 1;
        profile.level = newLevel;
  
        const newBadges: Badge[] = [];
        // ... lógica de badges (igual)
  
        storageService._saveProfile(profile);
        return { newBadges };
      } catch (error) {
        console.error("Falha ao salvar:", error);
        return { newBadges: [] };
      }
    },
    
    getHistory: (): AnalysisResult[] => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as AnalysisResult[];
      } catch (error) { return []; }
    },
  
    getById: (id: string): AnalysisResult | undefined => {
      const history = storageService.getHistory();
      return history.find(item => item.id === id);
    },
  
    deleteById: async (id: string): Promise<void> => {
      try {
        await audioStorage.deleteAudio(id);
        const currentHistory = storageService.getHistory();
        const newHistory = currentHistory.filter(item => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      } catch (error) { console.error(error); }
    }
};