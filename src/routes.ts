import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from './config/env';
import { isDatabaseConnected } from './config/database';

const router = Router();

router.get('/health', (_req, res) => {
  const mongo = isDatabaseConnected() ? 'connected' : 'disconnected';
  const ok = mongo === 'connected';
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degraded',
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
