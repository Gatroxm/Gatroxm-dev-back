import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from './config/env';
import { isDatabaseConnected } from './config/database';

const router = Router();

// Liveness: el proceso está vivo aunque MongoDB aún no esté disponible.
router.get('/health', (_req, res) => {
  const mongo = isDatabaseConnected() ? 'connected' : 'disconnected';
  res.status(200).json({
    status: mongo === 'connected' ? 'ok' : 'degraded',
    uptime: Math.floor(process.uptime()),
    mongo,
    db: env.mongoDb,
    timestamp: new Date().toISOString(),
  });
});

router.get('/ready', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ ready });
});

export default router;
