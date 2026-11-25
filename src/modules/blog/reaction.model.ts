import { Schema, model } from 'mongoose';
import { REACTION_TYPES } from './reaction.types';

const reactionSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'BlogPost', required: true, index: true },
    visitorId: { type: String, required: true, maxlength: 64 },
    type: { type: String, enum: REACTION_TYPES, required: true },
    // IP hasheada: permite limitar abusos sin almacenar la IP en claro.
    ipHash: { type: String, default: '' },
  },
  { timestamps: true },
);

// Un visitante = una reacción por publicación.
reactionSchema.index({ post: 1, visitorId: 1 }, { unique: true });
reactionSchema.index({ post: 1, type: 1 });

export const ReactionModel = model('Reaction', reactionSchema);
