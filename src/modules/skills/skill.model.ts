import { Schema, model } from 'mongoose';

const skillGroupSchema = new Schema(
  {
    category: { type: String, required: true, unique: true },
    items: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const SkillGroupModel = model('SkillGroup', skillGroupSchema);
