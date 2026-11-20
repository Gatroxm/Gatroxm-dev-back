import { z } from 'zod';

export const projectSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa un slug en kebab-case'),
  title: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['web', 'architecture', 'ai']),
  tags: z.array(z.string().min(1)).default([]),
  featured: z.boolean().default(false),
  links: z
    .object({ demo: z.string().optional(), repo: z.string().optional() })
    .partial()
    .default({}),
  media: z
    .object({
      poster: z.string().optional(),
      webm: z.string().optional(),
      mp4: z.string().optional(),
      pngSequence: z.string().optional(),
    })
    .partial()
    .default({}),
  order: z.number().int().default(0),
});

export const projectUpdateSchema = projectSchema.partial();
