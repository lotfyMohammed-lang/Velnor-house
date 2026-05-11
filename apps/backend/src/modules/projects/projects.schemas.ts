import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    color: z.string().optional().nullable(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});