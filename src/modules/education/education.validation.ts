import { z } from 'zod';

export const educationSchema = z.object({
  type: z.enum(['education', 'certification', 'language']),
  title: z.string().min(1),
  org: z.string().min(1),
  year: z.string().optional().default(''),
  href: z.string().url().optional().or(z.literal('')).optional().default(''),
  order: z.number().int().default(0),
});

export const educationUpdateSchema = educationSchema.partial();
