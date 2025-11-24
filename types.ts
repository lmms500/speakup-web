export enum ContextType {
  INTERVIEW = 'Simulação de Entrevista',
  SALES = 'Pitch de Vendas',
  PRESENTATION = 'Apresentação Formal',
  DIFFICULT_CONVERSATION = 'Conversa Difícil'
}

export interface AnalysisResult {
  id: string;          // Identificador único
  audioId?: string;    // ID para recuperar o áudio do banco
  timestamp: number;   // Data
  context: ContextType; 
  speech_detected: boolean;
  
  // 🔴 NOVO CAMPO OBRIGATÓRIO:
  transcript: string;  // O texto que a IA transcreveu
  
  score: number;
  vicios_linguagem_count: number;
  ritmo_analise: 'Muito Rápido' | 'Lento' | 'Ideal';
  feedback_positivo: string;
  ponto_melhoria: string;
  frase_reformulada: string;
  
  // Campo opcional para ajudar o Player de áudio na interface
  audioUrl?: string; 
}

export interface AnalysisResponse {
  result: AnalysisResult | null;
  error: string | null;
}

export type AppState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULTS';

// Adicionei 'DETAILS' aqui para facilitar a navegação no App.tsx
export type TabState = 'PRACTICE' | 'HISTORY' | 'DETAILS';

export interface NavigationState {
  view: TabState;
  detailId?: string;
}