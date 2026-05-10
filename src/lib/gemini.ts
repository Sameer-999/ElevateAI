import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateResumeScore(content: string, jobDescription?: string) {
  const prompt = `Analyze the following resume content and provide an ATS score (0-100), key improvements, and keyword suggestions. ${jobDescription ? `Context: Job Description: ${jobDescription}` : ''}
  Resume: ${content}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          summary: { type: Type.STRING }
        },
        required: ["score", "improvements", "keywords", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateProfessionalSummary(details: any) {
  const prompt = `Generate a high-impact professional summary based on these details: ${JSON.stringify(details)}`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}

export async function aiCareerCoach(message: string, history: any[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are ElevateAI Career Coach. Help users with resume tips, career advice, and portfolio building. Be professional, encouraging, and highly technical.",
    }
  });
  
  // Convert history for Gemini
  const chatHistory = history.map(h => ({
    role: h.role,
    parts: [{ text: h.text }]
  }));

  const response = await chat.sendMessage({ 
    message,
    // Add history if needed (simplified for now)
  });
  return response.text;
}
