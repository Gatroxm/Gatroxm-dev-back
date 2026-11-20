import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  subject: z.string().max(160).optional().default(''),
  message: z.string().min(10).max(4000),
  // honeypot: si viene con contenido se rechaza como spam
  website: z.string().optional().default(''),
});
