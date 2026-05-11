import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordErrorMessage = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().regex(passwordRegex, passwordErrorMessage),
    phone: z.string().min(10).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    username: z.string().min(1),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().regex(passwordRegex, passwordErrorMessage),
  }),
});