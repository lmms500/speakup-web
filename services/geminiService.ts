import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ContextType } from "../types";

// Recupera a chave das variáveis de ambiente
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERRO CRÍTICO: Chave de API não encontrada. Configure VITE_GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// Modelo 1.5 Flash é o mais rápido e estável para contas gratuitas
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const API_TIMEOUT_MS = 60000;

class AppError extends Error {
  constructor(message: string, public userMessage: string) {
    super(message);
    this.name = 'AppError';
  }
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeAudio = async (
  audioBlob: Blob, 
  context: ContextType
): Promise<AnalysisResult> => {
  
  if (!navigator.onLine) {
    throw new AppError("Offline", "Sem internet. Verifique a sua conexão e tente novamente.");
  }

  if (!apiKey) {
    throw new AppError("Config Error", "O sistema está sem a Chave de API. Avise o suporte.");
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);

    const prompt = `
      Atue como um coach de oratória. Analise o áudio. Contexto: ${context}.
      
      Responda APENAS JSON (sem markdown):
      {
        "speech_detected": boolean,
        "transcript": "texto transcrito",
        "score": number,
        "vicios_linguagem_count": number,
        "ritmo_analise": "Ideal" | "Lento" | "Muito Rápido",
        "sentiment": "Confiança" | "Nervosismo" | "Neutro" | "Entusiasmo",
        "feedback_positivo": "texto",
        "ponto_melhoria": "texto",
        "frase_reformulada": "texto"
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/mp3",
          data: base64Audio
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const rawResult = JSON.parse(cleanJson);

    return {
      ...rawResult,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      context: context
    } as AnalysisResult;

  } catch (error: any) {
    console.error("Erro Gemini Detalhado:", error);
    
    // --- TRATAMENTO DE ERROS PERSONALIZADO ---

    // Erro 503: Servidor do Google Sobrecarregado
    if (error.message?.includes("503")) {
        throw new AppError(
            "Service Overloaded", 
            "Os servidores da IA do Google estão com muito tráfego agora. Aguarde 1 minuto e tente novamente."
        );
    }

    // Erro 403: Chave Bloqueada ou Vazada
    if (error.message?.includes("403")) {
        throw new AppError(
            "Auth Error", 
            "Acesso negado pela segurança do Google. A chave de API precisa ser trocada."
        );
    }

    // Erro 404: Modelo não encontrado
    if (error.message?.includes("404")) {
        throw new AppError(
            "Model Error", 
            "Erro interno de modelo (404). A versão da IA está indisponível na sua região."
        );
    }

    // Erro 400: Chave Inválida
    if (error.message?.includes("400")) {
        throw new AppError(
            "Key Error", 
            "A chave de API parece inválida. Verifique as configurações."
        );
    }
    
    // Erro Genérico
    throw new AppError(
        "Unknown Error", 
        "Ocorreu um erro inesperado na análise. Tente gravar um áudio mais curto."
    );
  }
};