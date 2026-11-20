import { Router } from 'express';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { BlogPostModel } from './blog.model';
import { blogPostSchema, blogPostUpdateSchema } from './blog.validation';

const router = Router();

function normalizePublishedAt(data: Record<string, unknown>) {
  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }
  if (data.status === 'draft') {
    data.publishedAt = null;
  }
  return data;
}

// Public: list published posts
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await BlogPostModel.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    res.json(serializeMany(docs));
  }),
);

// Admin: list all posts (drafts + published) - must be before /:slug
router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const docs = await BlogPostModel.find().sort({ updatedAt: -1 }).lean();
    res.json(serializeMany(docs));
  }),
);

// Public: get by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const doc = await BlogPostModel.findOne({ slug: req.params.slug, status: 'published' }).lean();
    if (!doc) throw new AppError(404, 'Publicación no encontrada');
    res.json(serialize(doc));
  }),
);

// Admin: get by id (for editing)
router.get(
  '/admin/id/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await BlogPostModel.findById(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Publicación no encontrada');
    res.json(serialize(doc));
  }),
);

router.post(
  '/',
  requireAuth,
  requireAdmin,
  validate(blogPostSchema),
  asyncHandler(async (req, res) => {
    const data = normalizePublishedAt({ ...(req.body as Record<string, unknown>) });
    const doc = await BlogPostModel.create(data);
    res.status(201).json(serialize(doc.toObject()));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(blogPostUpdateSchema),
  asyncHandler(async (req, res) => {
    const data = normalizePublishedAt({ ...(req.body as Record<string, unknown>) });
    const doc = await BlogPostModel.findByIdAndUpdate(req.params.id, data, { new: true }).lean();
    if (!doc) throw new AppError(404, 'Publicación no encontrada');
    res.json(serialize(doc));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const doc = await BlogPostModel.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new AppError(404, 'Publicación no encontrada');
    res.json({ ok: true });
  }),
);

export default router;
