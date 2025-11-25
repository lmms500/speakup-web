export enum ContextType {
  INTERVIEW = 'INTERVIEW', // Mudado para chave simples
  SALES = 'SALES',
  PRESENTATION = 'PRESENTATION',
  DIFFICULT_CONVERSATION = 'DIFFICULT_CONVERSATION',
  CUSTOM = 'CUSTOM'
}

export type CoachPersona = 'MOTIVATOR' | 'STRICT' | 'FUNNY' | 'TECHNICAL';
export type Language = 'pt' | 'en' | 'es';

export interface AnalysisResult {
  id: string;
  audioId?: string;
  timestamp: number;
  context: ContextType | string; // Pode ser Enum Key ou String Customizada
  speech_detected: boolean;
  transcript: string;
  score: number;
  vicios_linguagem_count: number;
  ritmo_analise: 'Muito Rápido' | 'Lento' | 'Ideal';
  wpm?: number;
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
  lastTrainingDate: string | null;
  badges: string[];
  persona: CoachPersona;
  language: Language;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile, history: AnalysisResult[]) => boolean;
}

export type AppState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULTS';
export type TabState = 'PRACTICE' | 'HISTORY' | 'DETAILS' | 'PROFILE' | 'COMPARE';

export interface NavigationState {
  view: TabState;
  detailId?: string;
  compareIds?: [string, string];
}