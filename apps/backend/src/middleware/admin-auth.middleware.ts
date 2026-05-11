import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: {
    adminId: string;
    role: string;
  };
}

export const adminAuthMiddleware = (req: AdminRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      adminId: string;
      role: string;
    };

    if (!decoded.adminId || !decoded.role) {
      return res.status(401).json({ message: 'Invalid admin token' });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
