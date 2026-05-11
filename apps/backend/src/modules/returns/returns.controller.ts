import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReturnsService } from './returns.service';

export class ReturnsController {
  private returnsService = new ReturnsService();

  createReturnRequest = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const requestData = req.body;

      const result = await this.returnsService.createReturnRequest(userId, requestData);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };

  getUserReturnRequests = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await this.returnsService.getUserReturnRequests(userId);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  // Admin methods
  adminGetAll = async (_req: any, res: Response) => {
    try {
      const result = await this.returnsService.getAllReturnRequests();
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  adminUpdateStatus = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const result = await this.returnsService.updateReturnStatus(id, status);
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}
