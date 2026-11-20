import { Schema, model } from 'mongoose';

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
    author: { type: String, default: 'Gustavo Adolfo Muñoz Reyes' },
  },
  { timestamps: true },
);

blogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogPostModel = model('BlogPost', blogPostSchema);
