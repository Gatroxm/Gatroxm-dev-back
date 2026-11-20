import { z } from 'zod';

export const experienceSchema = z.object({
  role: z.string().min(1),
  company: z.string().min(1),
  period: z.string().min(1),
  tags: z.array(z.string().min(1)).default([]),
  bullets: z.array(z.string().min(1)).default([]),
  order: z.number().int().default(0),
});

export const experienceUpdateSchema = experienceSchema.partial();
