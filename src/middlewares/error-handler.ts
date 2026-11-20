import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../shared/AppError';
import { logger } from '../shared/logger';
import { isProduction } from '../config/env';

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    logger.warn(`${req.method} ${req.originalUrl} -> ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({ ok: false, error: err.message, details: err.details });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ ok: false, error: 'Datos inválidos', details: err.issues });
    return;
  }

  const anyErr = err as { code?: number; name?: string; message?: string };

  if (anyErr.code === 11000) {
    res.status(409).json({ ok: false, error: 'El recurso ya existe (valor duplicado).' });
    return;
  }

  if (anyErr.name === 'CastError') {
    res.status(400).json({ ok: false, error: 'Identificador inválido.' });
    return;
  }

  logger.error(`Error no controlado en ${req.method} ${req.originalUrl}`, err);
  res.status(500).json({
    ok: false,
    error: isProduction ? 'Error interno del servidor.' : anyErr.message || 'Error interno del servidor.',
  });
};
