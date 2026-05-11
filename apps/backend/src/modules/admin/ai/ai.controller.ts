import { Request, Response } from 'express';
import { AIService } from './ai.service';

export class AIController {
  static async query(req: Request, res: Response) {
    try {
      const query =
        typeof req.body?.query === 'string' ? req.body.query.trim() : '';

      console.log(`🤖 [AIController] Received query: "${query}"`);

      if (!query) {
        return res.status(400).json({ message: 'Query is required' });
      }

      const result = await AIService.processQuery(query);
      
      console.log(`✅ [AIController] Successfully processed query. Response type: ${result.type}`);
      
      return res.json(result);
    } catch (error) {
      console.error('❌ [AIController] Error:', error);

      const message =
        error instanceof Error ? error.message : 'Failed to process AI query';

      return res.status(500).json({ message });
    }
  }
}
