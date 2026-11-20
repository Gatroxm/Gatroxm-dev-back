import { Schema, model } from 'mongoose';

const adminUserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true },
);

export const AdminUserModel = model('AdminUser', adminUserSchema);
