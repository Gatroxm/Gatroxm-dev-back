import { Schema, model } from 'mongoose';

const statSchema = new Schema(
  {
    value: Number,
    suffix: String,
    text: String,
    label: { type: String, required: true },
  },
  { _id: false },
);

const flowStepSchema = new Schema(
  {
    title: { type: String, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const aboutSchema = new Schema(
  {
    paragraphs: { type: [String], default: [] },
    flow: { type: [flowStepSchema], default: [] },
  },
  { _id: false },
);

const contactSchema = new Schema(
  {
    email: { type: String, required: true },
    phone: { type: String, required: true },
    phoneHref: { type: String, required: true },
    whatsapp: { type: String, required: true },
    linkedin: { type: String, required: true },
    github: { type: String, required: true },
  },
  { _id: false },
);

const profileSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    roles: { type: [String], default: [] },
    title: { type: String, required: true },
    location: { type: String, required: true },
    lead: { type: String, required: true },
    stats: { type: [statSchema], default: [] },
    about: { type: aboutSchema, default: {} },
    contact: { type: contactSchema, required: true },
    resumeHref: { type: String, default: '' },
  },
  { timestamps: true },
);

export const ProfileModel = model('Profile', profileSchema);
