import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  description: z.string().trim().max(2000).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value like #3B82F6')
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value like #3B82F6')
    .nullable()
    .optional(),
});
