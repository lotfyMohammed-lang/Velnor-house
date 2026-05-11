import { Request, Response } from 'express';
import { AdminAuthService } from './admin-auth.service';

export class AdminAuthController {
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AdminAuthService.login(email, password);
      return res.status(200).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      return res.status(400).json({ message });
    }
  }

  static async register(req: any, res: Response) {
    try {
      // Check if current admin is super_admin
      if (req.admin?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admins can register new admins' });
      }

      const { name, email, password } = req.body;
      const result = await AdminAuthService.register(name, email, password);
      return res.status(201).json(result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      return res.status(400).json({ message });
    }
  }
}
