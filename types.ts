export enum ContextType {
  INTERVIEW = 'Simulação de Entrevista',
  SALES = 'Pitch de Vendas',
  PRESENTATION = 'Apresentação Formal',
  DIFFICULT_CONVERSATION = 'Conversa Difícil'
}

export interface AnalysisResult {
  id: string;        // Identificador único para o histórico
  audioId?: string;  // ID do áudio no IndexedDB
  timestamp: number; // Data da gravação
  context: ContextType; // O contexto escolhido
  speech_detected: boolean;
  score: number;
  vicios_linguagem_count: number;
  ritmo_analise: 'Muito Rápido' | 'Lento' | 'Ideal';
  feedback_positivo: string;
  ponto_melhoria: string;
  frase_reformulada: string;
}

export interface AnalysisResponse {
  result: AnalysisResult | null;
  error: string | null;
}

export type AppState = 'IDLE' | 'RECORDING' | 'ANALYZING' | 'RESULTS';
export type TabState = 'PRACTICE' | 'HISTORY';

// Novo estado para navegação detalhada
export interface NavigationState {
  view: TabState | 'DETAILS';
  detailId?: string;
}