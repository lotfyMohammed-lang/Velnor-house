import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Perfume } from '../../entities/Perfume';

export class PerfumesController {
  static async getAll(req: Request, res: Response) {
    try {
      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfumes = await perfumeRepo.find({
        order: { createdAt: 'DESC' },
      });

      // Strip costPrice for public API
      const safePerfumes = perfumes.map(p => ({
        ...p,
        sizes: p.sizes?.map(s => {
          const { costPrice, ...safeSize } = s;
          return safeSize;
        })
      }));

      return res.status(200).json(safePerfumes);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to fetch perfumes',
      });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      
      if (!rawId || Array.isArray(rawId)) {
        return res.status(400).json({ message: 'Invalid perfume id' });
      }

      const id = rawId;
      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = await perfumeRepo.findOneBy({ id });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      // Strip costPrice for public API
      const safePerfume = {
        ...perfume,
        sizes: perfume.sizes?.map(s => {
          const { costPrice, ...safeSize } = s;
          return safeSize;
        })
      };

      return res.status(200).json(safePerfume);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to fetch perfume',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = perfumeRepo.create(req.body);
      await perfumeRepo.save(perfume);
      return res.status(201).json(perfume);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to create perfume',
      });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;

      if (!rawId || Array.isArray(rawId)) {
        return res.status(400).json({ message: 'Invalid perfume id' });
      }

      const id = rawId;
      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = await perfumeRepo.findOneBy({ id });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      perfumeRepo.merge(perfume, req.body);
      await perfumeRepo.save(perfume);
      return res.status(200).json(perfume);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to update perfume',
      });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const rawId = req.params.id;

      if (!rawId || Array.isArray(rawId)) {
        return res.status(400).json({ message: 'Invalid perfume id' });
      }

      const id = rawId;
      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = await perfumeRepo.findOneBy({ id });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      await perfumeRepo.remove(perfume);
      return res.status(200).json({ message: 'Perfume deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to delete perfume',
      });
    }
  }
}