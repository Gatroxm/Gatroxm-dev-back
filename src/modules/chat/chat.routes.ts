import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { validate } from '../../middlewares/validate';
import { chatLimiter } from '../../middlewares/rate-limit';
import { chatSchema } from './chat.validation';
import { generateChatReply } from './chat.service';
import type { ChatMessage } from '../../shared/types';

const router = Router();

router.post(
  '/',
  chatLimiter,
  validate(chatSchema),
  asyncHandler(async (req, res) => {
    const { message, history } = req.body as { message: string; history: ChatMessage[] };
    const reply = await generateChatReply(message, history ?? []);
    res.json(reply);
  }),
);

export default router;
