import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type AIMetric = {
  label: string;
  value: string;
};

export type AIDetail = Record<string, string | number | null | undefined>;

export type AIItem = {
  name?: string;
  title?: string;
  value: string;
  subtitle?: string;
  status?: string;
};

export type AIResult = {
  type: 'text' | 'report' | 'ranking' | 'alert' | 'summary';
  title: string;
  summary: string;
  content?: string;
  metrics?: AIMetric[];
  details?: AIDetail[];
  items?: AIItem[];
  recommendations?: string[];
};

export const aiApi = {
  query: async (query: string): Promise<AIResult> => {
    const url = `${API_BASE_URL}/admin/ai/query`;
    console.log(`🚀 [aiApi] Sending OpenAI query to: ${url}`);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...getAdminHeaders(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.error(`❌ [aiApi] AI query failed:`, data);
        throw new Error(data?.message || 'Failed to process AI query');
      }

      const result = await response.json();
      console.log(`✅ [aiApi] Received OpenAI response:`, result);
      return result as AIResult;
    } catch (error) {
      console.error(`🔥 [aiApi] Network error:`, error);
      throw error;
    }
  },
};
