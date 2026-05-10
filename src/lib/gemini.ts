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
  const prompt = `Generate a high-impact professional summary based on these details: ${JSON.stringify(details)}. 
  Follow these rules:
  - Concise but impactful
  - 60-150 words
  - Strong but natural language
  - Modern and premium
  - Avoid cliches like "hardworking", "team player", "results-driven"
  - ATS optimized with relevant keywords.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });
  return response.text;
}

export async function generateProfessionalBrandKit(details: any, tone: string = 'modern') {
  const prompt = `Create a highly professional, ATS-optimized, confidence-building profile brand kit based on these details: ${JSON.stringify(details)}.
  Selected Tone/Style: ${tone}

  THE SUMMARY MUST:
  - Instantly communicate professional value
  - Make the user sound capable and trustworthy
  - Balance professionalism with authenticity
  - Highlight strengths without sounding fake
  - Be 60–150 words
  - Use strong but natural language
  - Avoid clichés (results-driven, team player, hardworking, etc.)

  STRUCTURE:
  1. Professional identity
  2. Core strengths (skills/tech/expertise)
  3. Value proposition (problems solved/measurable impact)
  4. Career direction (goals/vision)

  OUTPUT FORMAT (JSON):
  - mainSummary: The 60-150 word summary
  - linkedinHeadline: Short high-impact headline
  - portfolioBio: Concise bio for personal website
  - brandStatement: One-line powerful statement`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainSummary: { type: Type.STRING },
          linkedinHeadline: { type: Type.STRING },
          portfolioBio: { type: Type.STRING },
          brandStatement: { type: Type.STRING }
        },
        required: ["mainSummary", "linkedinHeadline", "portfolioBio", "brandStatement"]
      }
    }
  });

  return JSON.parse(response.text);
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
