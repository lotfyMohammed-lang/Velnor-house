import { Request, Response } from 'express';
import { AppDataSource } from '../../data-source';
import { Perfume } from '../../entities/Perfume';

function stripCostPrice(perfume: Perfume) {
  return {
    ...perfume,
    sizes: Array.isArray(perfume.sizes)
      ? perfume.sizes.map((size) => {
          const { costPrice, ...safeSize } = size;
          return safeSize;
        })
      : [],
  };
}

export class PerfumesController {
  static async getAll(req: Request, res: Response) {
    try {
      const perfumeRepo = AppDataSource.getRepository(Perfume);

      const perfumes = await perfumeRepo.find({
        order: { createdAt: 'DESC' },
      });

      const safePerfumes = perfumes.map(stripCostPrice);

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

      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = await perfumeRepo.findOne({
        where: { id: rawId },
      });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      return res.status(200).json(stripCostPrice(perfume));
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to fetch perfume',
      });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const perfumeRepo = AppDataSource.getRepository(Perfume);

      const perfume = perfumeRepo.create({
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        metadata: req.body.metadata ?? {},
        sizes: Array.isArray(req.body.sizes) ? req.body.sizes : [],
      });

      const savedPerfume = await perfumeRepo.save(perfume);

      return res.status(201).json(savedPerfume);
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

      const perfumeRepo = AppDataSource.getRepository(Perfume);
      const perfume = await perfumeRepo.findOne({
        where: { id: rawId },
      });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      perfumeRepo.merge(perfume, {
        ...req.body,
        tags: Array.isArray(req.body.tags) ? req.body.tags : perfume.tags,
        metadata: req.body.metadata ?? perfume.metadata,
        sizes: Array.isArray(req.body.sizes) ? req.body.sizes : perfume.sizes,
      });

      const updatedPerfume = await perfumeRepo.save(perfume);

      return res.status(200).json(updatedPerfume);
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

      const perfumeRepo = AppDataSource.getRepository(Perfume);

      const perfume = await perfumeRepo.findOne({
        where: { id: rawId },
      });

      if (!perfume) {
        return res.status(404).json({ message: 'Perfume not found' });
      }

      const deleteResult = await perfumeRepo.delete(rawId);

      if (!deleteResult.affected) {
        return res.status(500).json({ message: 'Failed to delete perfume' });
      }

      return res.status(200).json({
        message: 'Perfume deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Failed to delete perfume',
      });
    }
  }
}