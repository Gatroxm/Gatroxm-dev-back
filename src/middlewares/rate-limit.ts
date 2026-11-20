import rateLimit from 'express-rate-limit';

const message = { ok: false, error: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' };

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Has enviado varios mensajes. Intenta de nuevo en una hora.' },
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Límite de mensajes del asistente alcanzado. Intenta más tarde.' },
});
