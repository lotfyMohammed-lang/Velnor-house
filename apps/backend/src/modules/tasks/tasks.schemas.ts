import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.number().int(),
    title: z.string().min(1).max(255),
    description: z.string().optional().nullable(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    position: z.number().int().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional().nullable(),
    status: z.enum(['todo', 'in-progress', 'done']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    position: z.number().int().optional(),
  }),
});

export const listTasksSchema = z.object({
  query: z.object({
    projectId: z.string().optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({ id: z.string() }),
});