import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResult, CoachPersona, Language } from "../types";

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

// Traduções dos Personas para o Prompt
const PERSONA_PROMPTS: Record<Language, Record<CoachPersona, string>> = {
  pt: {
    MOTIVATOR: "Seja um coach inspirador e motivador. Elogie o esforço, use linguagem positiva.",
    STRICT: "Seja um crítico rigoroso. Foque na perfeição técnica. Seja direto.",
    FUNNY: "Seja engraçado e sarcástico. Faça piadas sobre os erros, mas dê dicas úteis.",
    TECHNICAL: "Seja analítico e técnico. Use termos de oratória e métricas."
  },
  en: {
    MOTIVATOR: "Be an inspiring and motivating coach. Praise effort, use positive language.",
    STRICT: "Be a strict critic. Focus on technical perfection. Be direct.",
    FUNNY: "Be funny and sarcastic. Joke about mistakes but give useful tips.",
    TECHNICAL: "Be analytical and technical. Use oratory terms and metrics."
  },
  es: {
    MOTIVATOR: "Sea un entrenador inspirador. Elogie el esfuerzo, use lenguaje positivo.",
    STRICT: "Sea un crítico estricto. Concéntrese en la perfección técnica. Sea directo.",
    FUNNY: "Sea divertido y sarcástico. Bromee sobre los errores pero dé consejos útiles.",
    TECHNICAL: "Sea analítico y técnico. Use términos de oratoria y métricas."
  }
};

export const analyzeAudio = async (
  audioBlob: Blob, 
  context: string,
  duration: number,
  persona: CoachPersona,
  language: Language // [NOVO]
): Promise<AnalysisResult> => {
  
  if (!navigator.onLine) throw new AppError("Offline", "Sem internet.");
  if (!apiKey) throw new AppError("Config Error", "Sem chave de API.");

  try {
    const base64Audio = await blobToBase64(audioBlob);
    
    const personaInstruction = PERSONA_PROMPTS[language][persona];
    const langInstruction = language === 'en' ? 'Respond in English' : language === 'es' ? 'Respond in Spanish' : 'Responda em Português';

    const prompt = `
      Act as a speech coach. Analyze the audio. 
      User Context: ${context}.
      
      YOUR PERSONALITY: ${personaInstruction}
      LANGUAGE: ${langInstruction}
      
      Respond ONLY JSON (no markdown):
      {
        "speech_detected": boolean,
        "transcript": "text transcribed in ${language}",
        "score": number (0-100),
        "vicios_linguagem_count": number,
        "ritmo_analise": "Ideal" | "Lento" | "Muito Rápido" (Translate this value to ${language}),
        "sentiment": "Confiança" | "Nervosismo" | "Neutro" | "Entusiasmo" (Translate this value to ${language}),
        "feedback_positivo": "text (in ${language})",
        "ponto_melhoria": "text (in ${language})",
        "frase_reformulada": "text (in ${language})"
      }
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "audio/mp3", data: base64Audio } }
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
    console.error("Gemini Error:", error);
    throw new AppError("Error", "Failed to analyze audio.");
  }
};