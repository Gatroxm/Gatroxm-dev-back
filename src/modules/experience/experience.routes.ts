import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { ExperienceModel } from './experience.model';
import { experienceSchema, experienceUpdateSchema } from './experience.validation';
import { experienceFallback } from '../../data/fallback';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await ExperienceModel.find().sort({ order: 1, createdAt: -1 }).lean();
    const items = docs.length ? serializeMany(docs) : experienceFallback;
    res.json(items);
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(experienceSchema),
  asyncHandler(async (req, res) => {
    const doc = await ExperienceModel.create(req.body);
    res.status(201).json(serialize(doc.toObject()));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(experienceUpdateSchema),
  asyncHandler(async (req, res) => {
    const doc = await ExperienceModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) throw new AppError(404, 'Experiencia no encontrada');
    res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await ExperienceModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Experiencia no encontrada');
    res.json({ ok: true });
  }),
);

export default router;
