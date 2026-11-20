import { z } from 'zod';

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(messageSchema).max(12).optional().default([]),
});
