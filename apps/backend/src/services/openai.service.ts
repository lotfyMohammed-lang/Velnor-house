import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AIStructuredResponse = {
  type: 'text' | 'report' | 'ranking' | 'alert' | 'summary';
  title: string;
  summary: string;
  content?: string;
  metrics?: Array<{ label: string; value: string }>;
  details?: Array<Record<string, any>>;
  items?: Array<{
    name?: string;
    title?: string;
    value: string;
    subtitle?: string;
    status?: string;
  }>;
  recommendations?: string[];
};

export class OpenAIService {
  static async query(userQuery: string, storeContext: string): Promise<AIStructuredResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured in backend .env');
    }

    const systemPrompt = `
      You are Velnor House AI, a sophisticated Business Intelligence Assistant for a fine perfumery store.
      Your goal is to provide accurate, data-driven insights to the store administrator.

      RULES:
      1. ONLY use the provided store context data.
      2. If data is missing or insufficient to answer, state that clearly. DO NOT hallucinate.
      3. Respond in the same language as the user query (English or Arabic).
      4. Always return a valid JSON object matching the requested schema.
      5. "metrics" should contain key high-level numbers.
      6. "items" should be used for lists or rankings.
      7. "details" can be used for tabular data.
      8. "type" must be one of: 'text', 'report', 'ranking', 'alert', 'summary'.
      9. Currency is EGP.

      STORE CONTEXT:
      ${storeContext}
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // or 'gpt-4o' for higher quality
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1, // Keep it grounded
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return JSON.parse(content) as AIStructuredResponse;
    } catch (error: any) {
      console.error('❌ [OpenAIService] Error:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }
}
