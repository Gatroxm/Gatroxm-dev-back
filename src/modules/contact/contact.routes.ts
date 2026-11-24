import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../shared/async-handler';
import { AppError } from '../../shared/AppError';
import { validate } from '../../middlewares/validate';
import { contactLimiter } from '../../middlewares/rate-limit';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { serialize, serializeMany } from '../../shared/serialize';
import { ContactMessageModel } from './contact.model';
import { contactMessageSchema } from './contact.validation';
import { logger } from '../../shared/logger';
import { sendContactNotification } from '../notifications/whatsapp.service';

const router = Router();

const statusUpdateSchema = z.object({
  status: z.enum(['new', 'read', 'replied']),
});

router.post(
  '/',
  contactLimiter,
  validate(contactMessageSchema),
  asyncHandler(async (req, res) => {
    const { name, email, subject, message, website } = req.body as {
      name: string; email: string; subject: string; message: string; website?: string;
    };

    // honeypot: bots suelen rellenar campos ocultos
    if (website && website.trim().length > 0) {
      logger.warn('Formulario de contacto rechazado por honeypot');
      // Responder con éxito aparente para no dar pistas al bot
      return res.status(201).json({ ok: true, id: 'rejected' });
    }

    const doc = await ContactMessageModel.create({
      name,
      email,
      subject,
      message,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? '',
    });

    if (!doc) throw new AppError(500, 'No se pudo guardar el mensaje');
    logger.info(`Nuevo mensaje de contacto de ${email}`);

    // Notificación en segundo plano: no bloquea la respuesta del formulario.
    void sendContactNotification({ name, email, subject, message });

    return res.status(201).json({ ok: true, id: String(doc._id) });
  }),
);

router.get(
  '/',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const docs = await ContactMessageModel.find().sort({ createdAt: -1 }).lean();
    return res.json(serializeMany(docs));
  }),
);

router.patch(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(statusUpdateSchema),
  asyncHandler(async (req, res) => {
    const doc = await ContactMessageModel.findByIdAndUpdate(
      req.params.id,
      { status: (req.body as { status: string }).status },
      { new: true },
    ).lean();
    if (!doc) throw new AppError(404, 'Mensaje no encontrado');
    return res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await ContactMessageModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Mensaje no encontrado');
    return res.json({ ok: true });
  }),
);

export default router;
