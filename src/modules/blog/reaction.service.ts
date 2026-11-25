/**
 * Reacciones del blog (estilo Facebook).
 *
 * Cada visitante anónimo se identifica con un `visitorId` aleatorio guardado en su
 * navegador. La base de datos mantiene una sola reacción por publicación y visitante,
 * así que se puede crear, cambiar o quitar.
 */
import { createHash } from 'node:crypto';
import type { Types } from 'mongoose';
import { ReactionModel } from './reaction.model';
import { REACTION_TYPES, emptyCounts, isReactionType } from './reaction.types';
import type { ReactionCounts, ReactionType } from './reaction.types';

export type { ReactionCounts, ReactionType } from './reaction.types';
export { REACTION_TYPES, emptyCounts, isReactionType } from './reaction.types';

export type ReactionAction = 'create' | 'update' | 'remove';

export interface ReactionSummary {
  counts: ReactionCounts;
  total: number;
  viewerReaction: ReactionType | null;
}

export function countsFromRows(rows: Array<{ _id: string; count: number }>): ReactionCounts {
  const counts = emptyCounts();
  for (const row of rows) {
    if (isReactionType(row._id)) counts[row._id] = row.count;
  }
  return counts;
}

export function totalFromCounts(counts: ReactionCounts): number {
  return REACTION_TYPES.reduce((sum, type) => sum + counts[type], 0);
}

/** Decide qué hacer al recibir una reacción: crear, cambiar o quitar (toggle). */
export function nextAction(existing: ReactionType | null, incoming: ReactionType): ReactionAction {
  if (!existing) return 'create';
  return existing === incoming ? 'remove' : 'update';
}

/** Valida el identificador anónimo del navegador (UUID sin guiones u similar). */
export function parseVisitorId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[a-zA-Z0-9_-]{8,64}$/.test(trimmed) ? trimmed : null;
}

/** Hash corto de la IP para límites anti-abuso, sin guardarla en claro. */
export function hashIp(ip: string | undefined, salt: string): string {
  if (!ip) return '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export async function getReactionSummary(
  postId: Types.ObjectId,
  visitorId?: string,
): Promise<ReactionSummary> {
  const rows = (await ReactionModel.aggregate([
    { $match: { post: postId } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ])) as Array<{ _id: string; count: number }>;

  const counts = countsFromRows(rows);
  let viewerReaction: ReactionType | null = null;

  if (visitorId) {
    const mine = await ReactionModel.findOne({ post: postId, visitorId })
      .select('type')
      .lean<{ type: ReactionType }>();
    viewerReaction = mine?.type ?? null;
  }

  return { counts, total: totalFromCounts(counts), viewerReaction };
}

/** Conteos de varias publicaciones en una sola consulta (para el listado y el panel admin). */
export async function getCountsForPosts(
  postIds: Types.ObjectId[],
): Promise<Map<string, ReactionCounts>> {
  const result = new Map<string, ReactionCounts>();
  if (!postIds.length) return result;

  const rows = (await ReactionModel.aggregate([
    { $match: { post: { $in: postIds } } },
    { $group: { _id: { post: '$post', type: '$type' }, count: { $sum: 1 } } },
  ])) as Array<{ _id: { post: Types.ObjectId; type: string }; count: number }>;

  for (const row of rows) {
    const key = String(row._id.post);
    const counts = result.get(key) ?? emptyCounts();
    if (isReactionType(row._id.type)) counts[row._id.type] = row.count;
    result.set(key, counts);
  }

  return result;
}
