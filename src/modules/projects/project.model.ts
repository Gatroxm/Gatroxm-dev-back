import { Schema, model } from 'mongoose';

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['web', 'architecture', 'ai'], required: true, index: true },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    links: {
      demo: { type: String, default: '' },
      repo: { type: String, default: '' },
    },
    media: {
      poster: { type: String, default: '' },
      webm: { type: String, default: '' },
      mp4: { type: String, default: '' },
      pngSequence: { type: String, default: '' },
    },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const ProjectModel = model('Project', projectSchema);
