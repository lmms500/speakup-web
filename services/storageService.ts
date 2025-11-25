import { AnalysisResult, UserProfile, Badge, CoachPersona } from "../types";
import { audioStorage } from "./audioStorage";

const STORAGE_KEY = 'speakup_history_v1';
const PROFILE_KEY = 'speakup_profile_v1';

// Definição das Medalhas
const BADGES: Badge[] = [
  {
    id: 'first_voice',
    name: 'Primeira Voz',
    description: 'Completou o primeiro treino',
    icon: '🎙️',
    condition: (_, history) => history.length >= 1
  },
  {
    id: 'streak_3',
    name: 'Em Chamas',
    description: '3 dias seguidos de treino',
    icon: '🔥',
    condition: (profile) => profile.streak >= 3
  },
  {
    id: 'score_90',
    name: 'Mestre da Oratória',
    description: 'Atingiu uma nota acima de 90',
    icon: '🏆',
    condition: (_, history) => history.some(h => h.score >= 90)
  },
  {
    id: 'clean_speech',
    name: 'Fala Limpa',
    description: 'Nenhum vício de linguagem detetado',
    icon: '✨',
    condition: (_, history) => history.some(h => h.vicios_linguagem_count === 0)
  }
];

export const storageService = {
  // --- Métodos Auxiliares ---
  
  _getProfile: (): UserProfile => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) return JSON.parse(stored);
    
    return {
      totalXp: 0,
      level: 1,
      streak: 0,
      lastTrainingDate: null,
      badges: [],
      persona: 'MOTIVATOR'
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

  // --- Core ---

  saveResult: async (result: AnalysisResult, audioBlob?: Blob): Promise<{ newBadges: Badge[] }> => {
    try {
      // 1. Salva Áudio
      if (audioBlob) {
        await audioStorage.saveAudio(result.id, audioBlob);
        result.audioId = result.id;
      }

      // 2. Salva Histórico
      const currentHistory = storageService.getHistory();
      const newHistory = [result, ...currentHistory];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));

      // 3. Atualiza Perfil (Gamificação)
      const profile = storageService._getProfile();
      const today = new Date().toDateString();
      const lastDate = profile.lastTrainingDate ? new Date(profile.lastTrainingDate).toDateString() : null;

      // Cálculo de Streak
      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate === yesterday.toDateString()) {
          profile.streak += 1;
        } else {
          profile.streak = 1; // Quebrou ou é o primeiro dia
        }
        profile.lastTrainingDate = new Date().toISOString();
      }

      // Cálculo de XP
      const xpGained = 100 + result.score;
      profile.totalXp += xpGained;
      
      // Cálculo de Nível
      const newLevel = Math.floor(Math.sqrt(profile.totalXp) / 5) + 1;
      profile.level = newLevel;

      // Verificação de Medalhas
      const newBadges: Badge[] = [];
      BADGES.forEach(badge => {
        if (!profile.badges.includes(badge.id)) {
          if (badge.condition(profile, newHistory)) {
            profile.badges.push(badge.id);
            newBadges.push(badge);
          }
        }
      });

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
    } catch (error) {
      return [];
    }
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
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  },

  // [NOVO] Métodos de Backup
  createBackup: (): string => {
    const profile = storageService._getProfile();
    const history = storageService.getHistory();
    
    const backupData = {
      version: 1,
      timestamp: Date.now(),
      appName: 'SpeakUp',
      profile,
      history
    };
    
    return JSON.stringify(backupData, null, 2);
  },

  restoreBackup: async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validação básica
      if (!data.profile || !data.history || data.appName !== 'SpeakUp') {
        throw new Error("Arquivo de backup inválido ou incompatível.");
      }

      // Restaura dados
      localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.history));
      
      return true;
    } catch (error) {
      console.error("Erro ao restaurar:", error);
      return false;
    }
  },

  getUserProfile: (): UserProfile => {
    return storageService._getProfile();
  },
  
  getAllBadges: (): Badge[] => BADGES,

  getStreak: (): number => {
    return storageService._getProfile().streak;
  }
};