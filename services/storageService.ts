import { AnalysisResult } from "../types";
import { audioStorage } from "./audioStorage";

const STORAGE_KEY = 'speakup_history_v1';

export const storageService = {
  saveResult: async (result: AnalysisResult, audioBlob?: Blob): Promise<void> => {
    
    try {
      // 1. Se tiver áudio, salva no IndexedDB usando o ID do resultado
      if (audioBlob) {
        await audioStorage.saveAudio(result.id, audioBlob);
        result.audioId = result.id; // Vincula
      }

      // 2. Salva o JSON no LocalStorage
      const currentHistory = storageService.getHistory();
      const newHistory = [result, ...currentHistory];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Falha ao salvar no histórico:", error);
    }
  },

  getHistory: (): AnalysisResult[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as AnalysisResult[];
    } catch (error) {
      console.error("Falha ao ler histórico:", error);
      return [];
    }
  },

  getById: (id: string): AnalysisResult | undefined => {
    const history = storageService.getHistory();
    return history.find(item => item.id === id);
  },

  clearHistory: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
    // Limpar IndexedDB seria ideal aqui também, mas para MVP vamos manter simples
  },

  // 🔥 Nova função para Gamificação (Streak/Ofensiva)
  getStreak: (): number => {
    const history = storageService.getHistory();
    if (history.length === 0) return 0;

    // 1. Extrai apenas as datas (sem horas) e remove duplicados
    const uniqueDates = Array.from(new Set(history.map(item => {
      return new Date(item.timestamp).toDateString();
    }))).map(dateString => new Date(dateString));

    // 2. Ordena da mais recente para a mais antiga
    uniqueDates.sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 3. Verifica se a sequência está ativa (treinou hoje ou ontem?)
    const lastTraining = uniqueDates[0];
    
    // Normaliza comparações de data
    const isToday = lastTraining.toDateString() === today.toDateString();
    const isYesterday = lastTraining.toDateString() === yesterday.toDateString();

    // Se o último treino não foi nem hoje nem ontem, a ofensiva zerou.
    if (!isToday && !isYesterday) {
      return 0; 
    }

    // 4. Conta os dias consecutivos
    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = uniqueDates[i];
      const next = uniqueDates[i + 1];
      
      // Calcula a diferença em dias
      const diffTime = Math.abs(current.getTime() - next.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        streak++;
      } else {
        break; // Buraco na sequência (ex: treinou hoje e anteontem = streak 1)
      }
    }

    return streak;
  }
};