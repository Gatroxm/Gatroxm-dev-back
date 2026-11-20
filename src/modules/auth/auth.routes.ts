import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../../shared/async-handler';
import { AppError } from '../../shared/AppError';
import { validate } from '../../middlewares/validate';
import { authLimiter } from '../../middlewares/rate-limit';
import { requireAuth } from '../../middlewares/auth';
import { env } from '../../config/env';
import { AdminUserModel } from './admin-user.model';
import { loginSchema } from './auth.validation';

const router = Router();

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };

    // Siempre intentar contra usuarios en BD; fallback al admin configurado por env (no requiere seed previo)
    const admin = await AdminUserModel.findOne({ username: username.toLowerCase() }).lean();
    let valid = false;
    let role = 'admin';
    let sub = username.toLowerCase();

    if (admin) {
      valid = await bcrypt.compare(password, admin.passwordHash);
      role = admin.role;
      sub = String(admin._id);
    } else if (
      username.toLowerCase() === env.adminUsername.toLowerCase() &&
      env.adminPassword &&
      password === env.adminPassword
    ) {
      valid = true;
    }

    if (!valid) throw new AppError(401, 'Credenciales inválidas');

    const token = jwt.sign({ sub, role }, env.jwtSecret, { expiresIn: '12h' });
    res.json({ token, user: { username: username.toLowerCase(), role } });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const username = typeof req.user?.sub === 'string' ? req.user.sub : '';
    res.json({ username, role: req.user?.role ?? 'admin' });
  }),
);

export default router;
