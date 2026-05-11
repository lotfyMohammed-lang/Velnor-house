import { Request, Response } from 'express';
import { financeService } from '../services/finance.service';

export const financeController = {
  getFinanceSummary: async (req: Request, res: Response) => {
    try {
      const summary = await financeService.getFinanceSummary();
      return res.json(summary);
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      return res.status(500).json({ message: 'Failed to retrieve finance summary' });
    }
  },
};
