import { Schema, model } from 'mongoose';

const experienceSchema = new Schema(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    period: { type: String, required: true },
    tags: { type: [String], default: [] },
    bullets: { type: [String], default: [] },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const ExperienceModel = model('Experience', experienceSchema);
