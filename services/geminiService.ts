import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ContextType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Configuração de Timeout (30 segundos)
const API_TIMEOUT_MS = 30000;

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
  
  // 1. Verificação de Conectividade
  if (!navigator.onLine) {
    throw new AppError(
      "Offline",
      "Parece que você está sem internet. Verifique sua conexão e tente novamente."
    );
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);

    const prompt = `
      Você é um coach especialista em oratória. Analise o áudio enviado.
      Contexto da fala: ${context}.
      
      IMPORTANTE:
      1. Verifique se há fala humana inteligível.
      2. Se houver apenas silêncio ou ruído, defina "speech_detected" como false.
      3. Se "speech_detected" for false, zere os outros campos.
      
      Retorne APENAS JSON.
    `;

    // 2. Promise com Timeout (Race Condition)
    const apiCall = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speech_detected: { type: Type.BOOLEAN },
            score: { type: Type.INTEGER },
            vicios_linguagem_count: { type: Type.INTEGER },
            ritmo_analise: { 
              type: Type.STRING, 
              enum: ["Muito Rápido", "Lento", "Ideal"] 
            },
            feedback_positivo: { type: Type.STRING },
            ponto_melhoria: { type: Type.STRING },
            frase_reformulada: { type: Type.STRING }
          },
          required: ["speech_detected", "score", "vicios_linguagem_count", "ritmo_analise", "feedback_positivo", "ponto_melhoria", "frase_reformulada"]
        }
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new AppError("Timeout", "A análise demorou muito. O servidor pode estar ocupado. Tente um áudio mais curto."));
      }, API_TIMEOUT_MS);
    });

    // Competição entre a API e o Timeout
    const response = await Promise.race([apiCall, timeoutPromise]);

    if (!response.text) {
      throw new AppError("Empty Response", "Não conseguimos receber uma resposta da IA.");
    }

    const rawResult = JSON.parse(response.text);

    // Adiciona metadados locais antes de retornar
    return {
      ...rawResult,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      context: context
    } as AnalysisResult;

  } catch (error: any) {
    console.error("Error analyzing audio:", error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    // Tratamento genérico para erros da API do Google
    throw new AppError(
      error.message || "Unknown API Error",
      "Ocorreu um erro inesperado na comunicação com a IA. Tente novamente em instantes."
    );
  }
};