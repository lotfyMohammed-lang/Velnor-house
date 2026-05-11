import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';


export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      const issues = err?.issues?.map((i: any) => ({
        path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
        message: i.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: issues ?? [],
      });
    }
  };


export const validateBody =
  (bodySchema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      bodySchema.parse(req.body);
      next();
    } catch (err: any) {
      const issues = err?.issues?.map((i: any) => ({
        path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
        message: i.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: issues ?? [],
      });
    }
  };
  export const validateQuery =
  (querySchema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      querySchema.parse(req.query);
      next();
    } catch (err: any) {
      const issues = err?.issues?.map((i: any) => ({
        path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
        message: i.message,
      }));

      return res.status(400).json({
        message: 'Validation error',
        errors: issues ?? [],
      });
    }
  };

export const parseId = (req: Request, res: Response, next: NextFunction) => {
  const raw = req.params.id;

  const id = Number(raw);
  if (!raw || Number.isNaN(id) || id <= 0) {
    return res.status(400).json({ message: 'Invalid id' });
  }

  (req as any).idNumber = id;
  next();
};