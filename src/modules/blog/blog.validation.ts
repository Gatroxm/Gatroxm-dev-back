import { z } from 'zod';

export const blogPostSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Usa un slug en kebab-case'),
  title: z.string().min(1),
  excerpt: z.string().min(1).max(300),
  content: z.string().min(1),
  coverImage: z.string().optional().default(''),
  tags: z.array(z.string().min(1)).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  publishedAt: z.string().datetime().nullable().optional(),
  author: z.string().optional().default('Gustavo Adolfo Muñoz Reyes'),
});

export const blogPostUpdateSchema = blogPostSchema.partial();
