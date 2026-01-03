
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Robust JSON parser that handles potential markdown wrappers
 */
const parseSafeJson = (text: string) => {
  try {
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Raw text:", text);
    const jsonMatch = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return [];
      }
    }
    return [];
  }
};

/**
 * Utility for exponential backoff retries.
 * Does not fall back to mock data to ensure user gets real results.
 */
const callWithRetry = async (fn: () => Promise<any>, retries = 3, delay = 1500): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message || "";
    const isQuotaError = errorMsg.includes('429') || error?.status === 429 || errorMsg.includes('RESOURCE_EXHAUSTED');
    
    // If it's a 429, don't retry! The daily limit is hit.
    if (isQuotaError) {
      throw new Error("STUDIO_QUOTA_EXCEEDED");
    }
    
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const searchCities = async (query: string) => {
  return callWithRetry(async () => {
    // Create new instance per call to pick up the latest injected API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a global travel expert. Based on the query "${query}", identify 5 specific and popular travel destinations (cities or major regions). 
      For each destination, provide its name, country, a cost index (1 to 10), 3-4 key highlights, and a professional enticing description. 
      Ensure the destinations are highly relevant to the search term.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              country: { type: Type.STRING },
              costIndex: { type: Type.NUMBER },
              highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING }
            },
            required: ["name", "country", "costIndex", "highlights", "description"]
          }
        }
      }
    });
    return parseSafeJson(response.text || '[]');
  });
};

export const suggestActivities = async (city: string, budget: string) => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Act as a local destination guide for "${city}". Suggest 4 diverse activities that fit a "${budget}" budget level. 
      Include the activity name, a category (e.g., Sightseeing, Food, Adventure), a brief description, the estimated cost in INR (numeric), and typical duration.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              cost: { type: Type.NUMBER },
              duration: { type: Type.STRING }
            },
            required: ["name", "type", "description", "cost", "duration"]
          }
        }
      }
    });
    return parseSafeJson(response.text || '[]');
  });
};

export const getBudgetInsight = async (itinerarySummary: string) => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this itinerary in Indian Rupees (INR) and provide a professional financial health check: ${itinerarySummary}. 
      Assess if the budget is realistic for these locations and activities. Provide 3 specific cost-saving tips and 1 high-value recommendation.`,
      config: {}
    });
    return response.text;
  });
};
