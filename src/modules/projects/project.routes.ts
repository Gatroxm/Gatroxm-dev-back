import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { ProjectModel } from './project.model';
import { projectSchema, projectUpdateSchema } from './project.validation';
import { projectsFallback } from '../../data/fallback';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await ProjectModel.find().sort({ order: 1, createdAt: -1 }).lean();
    const items = docs.length ? serializeMany(docs) : projectsFallback;
    res.json(items);
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const doc = await ProjectModel.findOne({ slug: req.params.slug }).lean();
    if (doc) return res.json(serialize(doc));
    const fallback = projectsFallback.find((p) => p.slug === req.params.slug);
    if (!fallback) throw new AppError(404, 'Proyecto no encontrado');
    return res.json(fallback);
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(projectSchema),
  asyncHandler(async (req, res) => {
    const doc = await ProjectModel.create(req.body);
    res.status(201).json(serialize(doc.toObject()));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(projectUpdateSchema),
  asyncHandler(async (req, res) => {
    const doc = await ProjectModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!doc) throw new AppError(404, 'Proyecto no encontrado');
    res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await ProjectModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Proyecto no encontrado');
    res.json({ ok: true });
  }),
);

export default router;
