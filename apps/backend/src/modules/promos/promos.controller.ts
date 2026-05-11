import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { PromoCode, DiscountType } from '../../entities/PromoCode';
import { PromoUsage } from '../../entities/PromoUsage';
import { AuthRequest } from '../../middleware/auth.middleware';

const promoRepository = AppDataSource.getRepository(PromoCode);
const usageRepository = AppDataSource.getRepository(PromoUsage);

export class PromosController {
  // Admin: Get all promo codes
  static async getAll(req: Request, res: Response) {
    try {
      const promos = await promoRepository.find({
        order: { createdAt: 'DESC' },
      });
      return res.status(200).json(promos);
    } catch (error) {
      console.error('GET ALL PROMOS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Admin: Create promo code
  static async create(req: Request, res: Response) {
    try {
      const { code, discountType, discountValue, maxDiscount, isActive } = req.body;

      if (!code || !discountType || discountValue === undefined) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const existing = await promoRepository.findOneBy({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ message: 'Promo code already exists' });
      }

      const promo = promoRepository.create({
        code: code.toUpperCase(),
        discountType,
        discountValue,
        maxDiscount: maxDiscount || 200,
        isActive: isActive !== undefined ? isActive : true,
      });

      await promoRepository.save(promo);
      return res.status(201).json(promo);
    } catch (error) {
      console.error('CREATE PROMO ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Admin: Toggle active status
  static async toggleStatus(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const promo = await promoRepository.findOneBy({ id });

      if (!promo) {
        return res.status(404).json({ message: 'Promo code not found' });
      }

      promo.isActive = !promo.isActive;
      await promoRepository.save(promo);

      return res.status(200).json(promo);
    } catch (error) {
      console.error('TOGGLE PROMO STATUS ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Admin: Delete promo code
  static async delete(req: Request, res: Response) {
    try {
      const id = String(req.params.id);
      const promo = await promoRepository.findOneBy({ id });

      if (!promo) {
        return res.status(404).json({ message: 'Promo code not found' });
      }

      await promoRepository.remove(promo);
      return res.status(200).json({ message: 'Promo code deleted successfully' });
    } catch (error) {
      console.error('DELETE PROMO ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Client: Validate promo code
  static async validate(req: AuthRequest, res: Response) {
    try {
      const { code } = req.body;
      const userId = req.user?.userId;

      if (!code) {
        return res.status(400).json({ message: 'Promo code is required' });
      }

      const promo = await promoRepository.findOneBy({
        code: code.toUpperCase(),
        isActive: true,
      });

      if (!promo) {
        return res.status(404).json({ message: 'Invalid or inactive promo code' });
      }

      // Check if user already used this promo
      const usage = await usageRepository.findOne({
        where: {
          user: { id: userId },
          promoCode: { id: promo.id },
        },
      });

      if (usage) {
        return res.status(400).json({ message: 'You have already used this promo code' });
      }

      return res.status(200).json({
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue,
        maxDiscount: promo.maxDiscount,
      });
    } catch (error) {
      console.error('VALIDATE PROMO ERROR:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
