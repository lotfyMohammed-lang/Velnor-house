import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    username: z.string().min(2).max(100).optional().nullable(),
    phone: z
      .string()
      .regex(/^01[0-9]{9}$/, 'Phone must be exactly 11 digits and start with 01')
      .optional()
      .nullable()
      .or(z.literal('')),
    gender: z.enum(['male', 'female']).optional().nullable().or(z.literal('')),
    birthDate: z
      .string()
      .refine(
        (date) => {
          if (!date || date === '') return true;
          return new Date(date) <= new Date();
        },
        { message: 'Birth date cannot be in the future' }
      )
      .optional()
      .nullable()
      .or(z.literal('')),
    country: z.string().optional().nullable().or(z.literal('')),
  }),
});