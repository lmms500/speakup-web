import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, CoachPersona } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("ERRO CRÍTICO: Chave de API não encontrada. Configure VITE_GEMINI_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

// Helper para definir o tom com base na persona
const getPersonaPrompt = (persona: CoachPersona): string => {
  switch (persona) {
    case 'STRICT':
      return "Seja um crítico rigoroso e exigente. Não amenize os erros. Foque na perfeição técnica. Seja direto e curto.";
    case 'FUNNY':
      return "Seja engraçado, use sarcasmo leve e metáforas divertidas. Faça piadas sobre os erros, mas dê dicas úteis. Use emojis.";
    case 'TECHNICAL':
      return "Seja analítico e acadêmico. Use termos técnicos de fonoaudiologia e oratória. Foque em métricas e precisão.";
    case 'MOTIVATOR':
    default:
      return "Seja um coach inspirador e motivador. Elogie o esforço, use linguagem positiva e encorajadora. Fale como um mentor gentil.";
  }
};

export const analyzeAudio = async (
  audioBlob: Blob, 
  context: string,
  duration: number,
  persona: CoachPersona // [NOVO]
): Promise<AnalysisResult> => {
  
  if (!navigator.onLine) {
    throw new AppError("Offline", "Sem internet. Verifique a sua conexão e tente novamente.");
  }

  if (!apiKey) {
    throw new AppError("Config Error", "O sistema está sem a Chave de API. Avise o suporte.");
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);
    
    // [NOVO] Injeta a instrução da persona
    const personaInstruction = getPersonaPrompt(persona);

    const prompt = `
      Atue como um coach de oratória. Analise o áudio. 
      Contexto do usuário: ${context}.
      
      SUA PERSONALIDADE: ${personaInstruction}
      
      Responda APENAS JSON (sem markdown):
      {
        "speech_detected": boolean,
        "transcript": "texto transcrito",
        "score": number,
        "vicios_linguagem_count": number,
        "ritmo_analise": "Ideal" | "Lento" | "Muito Rápido",
        "sentiment": "Confiança" | "Nervosismo" | "Neutro" | "Entusiasmo",
        "feedback_positivo": "texto (no seu tom de personalidade)",
        "ponto_melhoria": "texto (no seu tom de personalidade)",
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

    const wordCount = rawResult.transcript ? rawResult.transcript.trim().split(/\s+/).length : 0;
    const durationInMinutes = duration > 0 ? duration / 60 : 1;
    const wpm = Math.round(wordCount / durationInMinutes);

    return {
      ...rawResult,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      context: context,
      wpm: wpm
    } as AnalysisResult;

  } catch (error: any) {
    console.error("Erro Gemini Detalhado:", error);
    
    if (error.message?.includes("503")) {
        throw new AppError("Service Overloaded", "Os servidores da IA do Google estão com muito tráfego agora. Aguarde 1 minuto e tente novamente.");
    }
    if (error.message?.includes("403")) {
        throw new AppError("Auth Error", "Acesso negado pela segurança do Google. A chave de API precisa ser trocada.");
    }
    if (error.message?.includes("404")) {
        throw new AppError("Model Error", "Erro interno de modelo (404). A versão da IA está indisponível na sua região.");
    }
    if (error.message?.includes("400")) {
        throw new AppError("Key Error", "A chave de API parece inválida. Verifique as configurações.");
    }
    
    throw new AppError("Unknown Error", "Ocorreu um erro inesperado na análise. Tente gravar um áudio mais curto.");
  }
};