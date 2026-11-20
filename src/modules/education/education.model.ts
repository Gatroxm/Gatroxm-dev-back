import { Schema, model } from 'mongoose';

const educationSchema = new Schema(
  {
    type: { type: String, enum: ['education', 'certification', 'language'], required: true, index: true },
    title: { type: String, required: true },
    org: { type: String, required: true },
    year: { type: String, default: '' },
    href: { type: String, default: '' },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true },
);

export const EducationModel = model('Education', educationSchema);
