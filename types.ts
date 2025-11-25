export enum ContextType {
  INTERVIEW = 'Simulação de Entrevista',
  SALES = 'Pitch de Vendas',
  PRESENTATION = 'Apresentação Formal',
  DIFFICULT_CONVERSATION = 'Conversa Difícil',
  CUSTOM = 'Cenário Personalizado'
}

// [NOVO] Tipos de personalidade
export type CoachPersona = 'MOTIVATOR' | 'STRICT' | 'FUNNY' | 'TECHNICAL';

export interface AnalysisResult {
  id: string;
  audioId?: string;
  timestamp: number;
  context: ContextType | string;
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
  persona: CoachPersona; // [NOVO] Campo de persona
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile, history: AnalysisResult[]) => boolean;
}

export type AppState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULTS';
export type TabState = 'PRACTICE' | 'HISTORY' | 'DETAILS' | 'PROFILE';

export interface NavigationState {
  view: TabState;
  detailId?: string;
}