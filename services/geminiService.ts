import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ContextType } from "../types";

// 🟢 VOLTAMOS PARA O MODO SEGURO:
// A chave virá do arquivo .env (local) ou das Configurações da Vercel (online)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Validação de segurança para te avisar no console se esquecer a chave
if (!apiKey) {
  console.error("ERRO CRÍTICO: Chave de API não encontrada. Configure VITE_GEMINI_API_KEY no .env ou na Vercel.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

// 🟢 MODELO ESTÁVEL: Usando 1.5 Flash para garantir que funcione sem erro 404/503
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    throw new AppError("Offline", "Verifique sua conexão.");
  }

  if (!apiKey) {
    throw new AppError("Config Error", "Chave de API não configurada. Avise o administrador.");
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
        "ritmo_analise": "Ideal",
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
    console.error("Erro Gemini:", error);
    
    if (error.message?.includes("403")) {
        throw new AppError("Auth Error", "Chave de API bloqueada ou vazada. Gere uma nova no Google AI Studio.");
    }
    if (error.message?.includes("404")) {
        throw new AppError("Model Error", "Erro de modelo. Verifique a disponibilidade do Gemini 1.5 Flash.");
    }
    
    throw new AppError("Erro na IA", "Não foi possível analisar o áudio.");
  }
};