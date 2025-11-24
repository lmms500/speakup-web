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
  }
};