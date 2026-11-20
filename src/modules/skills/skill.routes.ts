import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { SkillGroupModel } from './skill.model';
import { skillSchema, skillUpdateSchema } from './skill.validation';
import { skillsFallback } from '../../data/fallback';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await SkillGroupModel.find().sort({ order: 1 }).lean();
    const items = docs.length ? serializeMany(docs) : skillsFallback;
    res.json(items);
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(skillSchema),
  asyncHandler(async (req, res) => {
    const doc = await SkillGroupModel.create(req.body);
    res.status(201).json(serialize(doc.toObject()));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(skillUpdateSchema),
  asyncHandler(async (req, res) => {
    const doc = await SkillGroupModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) throw new AppError(404, 'Grupo de habilidades no encontrado');
    res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await SkillGroupModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Grupo de habilidades no encontrado');
    res.json({ ok: true });
  }),
);

export default router;
