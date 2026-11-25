export const REACTION_TYPES = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];
export type ReactionCounts = Record<ReactionType, number>;

export function isReactionType(value: unknown): value is ReactionType {
  return typeof value === 'string' && (REACTION_TYPES as readonly string[]).includes(value);
}

export function emptyCounts(): ReactionCounts {
  return { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 };
}
