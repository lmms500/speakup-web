import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ContextType } from "../types";

// 🔴 COLE SUA CHAVE AQUI (Tudo na mesma linha):
const apiKey = "AIzaSyAxD9fO9OSYYEWtVexKYFhToeU1ycU_YTY"; 

// Inicializa a IA
const genAI = new GoogleGenerativeAI(apiKey);
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
      Você é um coach de oratória. Analise este áudio. Contexto: ${context}.
      Verifique se há fala humana. Se for silêncio/ruído, speech_detected=false.
      
      Responda APENAS com este JSON exato, sem markdown:
      {
        "speech_detected": boolean,
        "score": number (0-100),
        "vicios_linguagem_count": number,
        "ritmo_analise": "Muito Rápido" | "Lento" | "Ideal",
        "feedback_positivo": "string",
        "ponto_melhoria": "string",
        "frase_reformulada": "string"
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
    
    // Limpa qualquer formatação markdown que a IA possa enviar
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
    if (error.message?.includes("404")) {
        throw new AppError("Model Error", "Erro de modelo ou chave inválida.");
    }
    throw new AppError("Erro na IA", "Não foi possível analisar o áudio.");
  }
};