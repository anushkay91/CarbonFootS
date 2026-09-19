import { GoogleGenAI } from '@google/genai';

export interface CoachContext {
  totalEstimatedCO2e: number;
  activityCount: number;
  largestSource?: {
    activityType: string;
    category: string;
    estimatedCO2e: number;
  };
  activeGoal?: {
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    cadence: string;
    isAchieved: boolean;
  };
  recommendation?: {
    title: string;
    action: string;
    reasonText: string;
  };
  scenario?: {
    activityType: string;
    currentValue: number;
    scenarioValue: number;
    unit: string;
    estimatedChange: number;
  };
}

export interface CoachResponse {
  summary: string;
  reason: string;
  action: string;
  limitations: string;
}

export class GeminiCoachService {
  private static getClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }
    return new GoogleGenAI({ apiKey });
  }

  static async generateCoachingResponse(context: CoachContext, userPrompt?: string): Promise<CoachResponse> {
    const ai = this.getClient();
    // Using gemini-3.6-flash per error instructions
    const model = 'gemini-3.6-flash';

    const systemInstruction = `You are CarbonFootS's official explanation and coaching assistant.
HARD RULES:
1. Use ONLY supplied structured facts.
2. NEVER invent carbon values, numbers, or emission factors.
3. NEVER change deterministic results.
4. Keep all explanations grounded strictly in the provided context.
5. Format your response strictly as a JSON object with keys: "summary", "reason", "action", "limitations".
`;

    const prompt = `Context Facts:
${JSON.stringify(context, null, 2)}

User Question: ${userPrompt || 'Explain what is driving my carbon footprint and what action I should consider.'}

Return valid JSON with keys: "summary", "reason", "action", "limitations".`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(text);
      return {
        summary: parsed.summary || 'Based on your recorded activity...',
        reason: parsed.reason || 'Your recorded activities drive this footprint pattern.',
        action: parsed.action || 'Consider reviewing your recorded sources.',
        limitations: parsed.limitations || 'Based on recorded activity for the selected period.'
      };
    } catch (error) {
      console.error('[GeminiCoachService] Error generating coaching response:', error);
      throw error;
    }
  }
}
