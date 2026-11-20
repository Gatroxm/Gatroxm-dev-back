import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../shared/logger';

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB conectado (base: ${env.mongoDb})`);
  });
  mongoose.connection.on('error', (error) => {
    logger.error('Error de MongoDB', error);
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB desconectado');
  });

  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDb,
    serverSelectionTimeoutMS: 15000,
  });
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
