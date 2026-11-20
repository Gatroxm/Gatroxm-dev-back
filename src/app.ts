import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { logger } from './shared/logger';
import { apiLimiter } from './middlewares/rate-limit';
import { errorHandler, notFound } from './middlewares/error-handler';
import systemRoutes from './routes';
import profileRoutes from './modules/profile/profile.routes';
import projectRoutes from './modules/projects/project.routes';
import experienceRoutes from './modules/experience/experience.routes';
import skillsRoutes from './modules/skills/skill.routes';
import educationRoutes from './modules/education/education.routes';
import contactRoutes from './modules/contact/contact.routes';
import authRoutes from './modules/auth/auth.routes';
import chatRoutes from './modules/chat/chat.routes';
import blogRoutes from './modules/blog/blog.routes';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());

  // FRONTEND_URL admite varios orígenes separados por coma.
  const allowedOrigins = new Set([
    ...env.frontendUrl
      .split(',')
      .map((value) => value.trim().replace(/\/+$/, ''))
      .filter(Boolean),
    'http://localhost:4200',
    'http://127.0.0.1:4200',
  ]);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Permitir herramientas locales sin origin (curl, Postman) y orígenes conocidos
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        // No lanzamos error: evitamos un 500 y dejamos que el navegador bloquee la respuesta.
        logger.warn(`CORS bloqueado para origen: ${origin}`);
        return callback(null, false);
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false }));

  app.use('/api', apiLimiter);
  app.use('/api', systemRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/experience', experienceRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/education', educationRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/blog', blogRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
