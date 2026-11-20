import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { EducationModel } from './education.model';
import { educationSchema, educationUpdateSchema } from './education.validation';
import { educationFallback } from '../../data/fallback';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type =
      typeof req.query.type === 'string' &&
      ['education', 'certification', 'language'].includes(req.query.type)
        ? (req.query.type as 'education' | 'certification' | 'language')
        : undefined;

    const docs = await EducationModel.find(type ? { type } : {})
      .sort({ order: 1, year: -1 })
      .lean();
    if (docs.length) return res.json(serializeMany(docs));

    const items = type
      ? educationFallback.filter((e) => e.type === type)
      : educationFallback;
    return res.json(items);
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(educationSchema),
  asyncHandler(async (req, res) => {
    const doc = await EducationModel.create(req.body);
    res.status(201).json(serialize(doc.toObject()));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(educationUpdateSchema),
  asyncHandler(async (req, res) => {
    const doc = await EducationModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) throw new AppError(404, 'Registro educativo no encontrado');
    res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await EducationModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Registro educativo no encontrado');
    res.json({ ok: true });
  }),
);

export default router;
