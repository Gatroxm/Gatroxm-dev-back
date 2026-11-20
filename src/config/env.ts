import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Falta la variable de entorno obligatoria: ${name}`);
  }
  return value.trim();
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongoUri: required('MONGODB_URI'),
  mongoDb: process.env.MONGODB_DB?.trim() || 'gatroxm_portfolio',
  frontendUrl: process.env.FRONTEND_URL?.trim() || 'http://localhost:4200',
  jwtSecret: required('JWT_SECRET'),
  adminUsername: process.env.ADMIN_USERNAME?.trim() || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',
  ai: {
    apiKey: process.env.AI_API_KEY?.trim() || '',
    baseUrl: (process.env.AI_BASE_URL?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, ''),
    model: process.env.AI_MODEL?.trim() || 'gpt-4o-mini',
  },
};

export const isProduction = env.nodeEnv === 'production';
