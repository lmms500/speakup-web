export enum ContextType {
  INTERVIEW = 'Simulação de Entrevista',
  SALES = 'Pitch de Vendas',
  PRESENTATION = 'Apresentação Formal',
  DIFFICULT_CONVERSATION = 'Conversa Difícil'
}

export interface AnalysisResult {
  id: string;
  audioId?: string;
  timestamp: number;
  context: ContextType;
  speech_detected: boolean;
  transcript: string;
  score: number;
  vicios_linguagem_count: number;
  ritmo_analise: 'Muito Rápido' | 'Lento' | 'Ideal';
  
  // Novo Campo de Sentimento
  sentiment?: 'Confiança' | 'Nervosismo' | 'Neutro' | 'Entusiasmo';
  
  feedback_positivo: string;
  ponto_melhoria: string;
  frase_reformulada: string;
  audioUrl?: string;
}

export interface UserProfile {
  totalXp: number;
  level: number;
  streak: number;
  lastTrainingDate: string | null; // ISO String
  badges: string[]; // IDs das medalhas conquistadas
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji ou ícone
  condition: (profile: UserProfile, history: AnalysisResult[]) => boolean;
}

export type AppState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULTS';
export type TabState = 'PRACTICE' | 'HISTORY' | 'DETAILS' | 'PROFILE'; // Nova aba Profile

export interface NavigationState {
  view: TabState;
  detailId?: string;
}