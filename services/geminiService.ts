import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, ContextType } from "../types";

// 🟢 O JEITO CERTO: Lê a variável de ambiente, não a chave direta
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERRO: Chave de API não encontrada. Configure VITE_GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use 1.5, é o mais estável

const API_TIMEOUT_MS = 60000;

// ... (o resto do código continua igual, classe AppError, blobToBase64, etc.) ...
// Se precisar do resto do arquivo, me avise, mas o importante é o topo acima.

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
    throw new AppError("Config Error", "Chave de API não configurada. Avise o desenvolvedor.");
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);

    const prompt = `
      Você é um coach de oratória. Analise este áudio. Contexto: ${context}.
      
      TAREFAS:
      1. Transcreva o áudio fielmente (em português).
      2. Verifique se há fala humana. Se silêncio/ruído, speech_detected=false.
      
      Responda APENAS com este JSON exato, sem markdown:
      {
        "speech_detected": boolean,
        "transcript": "texto completo transcrito aqui",
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
        throw new AppError("Model Error", "Erro de modelo. Verifique a API Key.");
    }
    // Tratamento específico para chave vazada/bloqueada
    if (error.message?.includes("403")) {
        throw new AppError("Auth Error", "Chave de API bloqueada pelo Google. Gere uma nova.");
    }
    throw new AppError("Erro na IA", "Não foi possível analisar o áudio.");
  }
};