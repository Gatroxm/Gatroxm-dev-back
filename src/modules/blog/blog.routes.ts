import { Router } from 'express';
import { z } from 'zod';
import type { Types } from 'mongoose';
import { asyncHandler } from '../../shared/async-handler';
import { serialize, serializeMany } from '../../shared/serialize';
import { AppError } from '../../shared/AppError';
import { requireAdmin, requireAuth } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { reactionLimiter } from '../../middlewares/rate-limit';
import { env } from '../../config/env';
import { BlogPostModel } from './blog.model';
import { blogPostSchema, blogPostUpdateSchema } from './blog.validation';
import { ReactionModel } from './reaction.model';
import {
  REACTION_TYPES,
  emptyCounts,
  getCountsForPosts,
  getReactionSummary,
  hashIp,
  nextAction,
  parseVisitorId,
  totalFromCounts,
} from './reaction.service';
import type { ReactionType } from './reaction.service';

const router = Router();

const reactionBodySchema = z.object({
  type: z.enum(REACTION_TYPES),
  visitorId: z.string().trim().regex(/^[a-zA-Z0-9_-]{8,64}$/),
});

function normalizePublishedAt(data: Record<string, unknown>) {
  if (data.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }
  if (data.status === 'draft') {
    data.publishedAt = null;
  }
  return data;
}

async function findPublishedPost(slug: string) {
  const post = await BlogPostModel.findOne({ slug, status: 'published' }).select('_id').lean();
  if (!post) throw new AppError(404, 'Publicación no encontrada');
  return post;
}

/** Agrega los conteos de reacciones a una lista de publicaciones. */
async function withReactions<T extends { _id: unknown }>(docs: T[]) {
  const countsByPost = await getCountsForPosts(docs.map((doc) => doc._id as Types.ObjectId));
  return docs.map((doc) => {
    const counts = countsByPost.get(String(doc._id)) ?? emptyCounts();
    return { ...doc, reactions: { counts, total: totalFromCounts(counts) } };
  });
}

// Public: list published posts
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const docs = await BlogPostModel.find({ status: 'published' })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    res.json(serializeMany(await withReactions(docs)));
  }),
);

// Admin: list all posts (drafts + published) - must be before /:slug
router.get(
  '/admin/all',
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const docs = await BlogPostModel.find().sort({ updatedAt: -1 }).lean();
    res.json(serializeMany(await withReactions(docs)));
  }),
);

// Public: reaction summary of a post
router.get(
  '/:slug/reactions',
  asyncHandler(async (req, res) => {
    const post = await findPublishedPost(String(req.params.slug));
    const visitorId = parseVisitorId(req.query.visitorId) ?? undefined;
    res.json(await getReactionSummary(post._id, visitorId));
  }),
);

// Public: create, change or remove the visitor reaction
router.post(
  '/:slug/reactions',
  reactionLimiter,
  validate(reactionBodySchema),
  asyncHandler(async (req, res) => {
    const post = await findPublishedPost(String(req.params.slug));
    const { type, visitorId } = req.body as { type: ReactionType; visitorId: string };
    const existing = await ReactionModel.findOne({ post: post._id, visitorId })
      .select('type')
      .lean<{ type: ReactionType }>();
    const action = nextAction(existing?.type ?? null, type);
    const ipHash = hashIp(req.ip, env.jwtSecret);

    if (action === 'remove') {
      await ReactionModel.deleteOne({ post: post._id, visitorId });
    } else if (action === 'update') {
      await ReactionModel.updateOne({ post: post._id, visitorId }, { $set: { type, ipHash } });
    } else {
      try {
        await ReactionModel.create({ post: post._id, visitorId, type, ipHash });
      } catch (error) {
        // Índice único: dos peticiones simultáneas del mismo visitante.
        if ((error as { code?: number }).code !== 11000) throw error;
        await ReactionModel.updateOne({ post: post._id, visitorId }, { $set: { type, ipHash } });
      }
    }

    res.json(await getReactionSummary(post._id, visitorId));
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
