import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  static async googleLogin(req: Request, res: Response) {
    try {
      const { credential } = req.body;
      const result = await AuthService.googleLogin(credential);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async facebookLogin(req: Request, res: Response) {
    try {
      const { accessToken } = req.body;
      const result = await AuthService.facebookLogin(accessToken);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async twitterLogin(req: Request, res: Response) {
    try {
      const { twitterId, username, email } = req.body;
      const result = await AuthService.twitterLogin(twitterId, username, email);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, phone } = req.body;
      const result = await AuthService.register(username, email, password, phone);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const { username } = req.body;
      const result = await AuthService.forgotPassword(username);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Something went wrong' });
    }
  }
}
