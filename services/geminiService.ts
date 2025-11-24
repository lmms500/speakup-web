import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ContextType } from "../types";

// 🔴 1. COLE SUA NOVA CHAVE AQUI:
const apiKey = "AIzaSyBT4QKRI64magPXyNOK0VXl64RyaIXj_5A"; 

const genAI = new GoogleGenerativeAI(apiKey);

// 🔴 2. MODELO ATUALIZADO (O 1.5 foi descontinuado):
// Usamos 'gemini-2.5-flash' que é a versão padrão atual.
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
    
    // Tratamento de erros comuns
    if (error.message?.includes("404")) {
        throw new AppError("Model Error", "Erro 404: O modelo 1.5 foi descontinuado. Verifique se o código usa 'gemini-2.5-flash'.");
    }
    if (error.message?.includes("503")) {
        throw new AppError("Busy", "A IA está sobrecarregada (503). Tente novamente em 10 segundos.");
    }
    if (error.message?.includes("400")) {
       throw new AppError("Auth Error", "Chave de API inválida ou expirada.");
    }

    throw new AppError("Erro na IA", "Não foi possível analisar o áudio.");
  }
};