import { z } from 'zod';

export const skillSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)).default([]),
  order: z.number().int().default(0),
});

export const skillUpdateSchema = skillSchema.partial();
