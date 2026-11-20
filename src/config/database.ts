import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../shared/logger';

let listenersRegistered = false;
let lastConnectionError: string | null = null;

function registerListeners(): void {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    lastConnectionError = null;
    logger.info(`MongoDB conectado (base: ${env.mongoDb})`);
  });
  mongoose.connection.on('error', (error) => {
    lastConnectionError = error instanceof Error ? error.message : String(error);
    logger.error('Error de MongoDB', error);
  });
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB desconectado');
  });
}

export async function connectDatabase(): Promise<void> {
  mongoose.set('strictQuery', true);
  registerListeners();

  try {
    await mongoose.connect(env.mongoUri, {
      dbName: env.mongoDb,
      serverSelectionTimeoutMS: 15000,
    });
    lastConnectionError = null;
  } catch (error) {
    lastConnectionError = error instanceof Error ? error.message : String(error);
    throw error;
  }
}

/**
 * Conecta a MongoDB en segundo plano con reintentos.
 * Evita que el proceso muera en bucle si Atlas no responde al arrancar
 * (por ejemplo, si falta habilitar la IP de Render en Network Access).
 */
export function startDatabaseConnection(retryDelayMs = 10000): void {
  let attempts = 0;

  const attempt = async (): Promise<void> => {
    attempts += 1;
    try {
      await connectDatabase();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      logger.error(
        `No se pudo conectar a MongoDB (intento ${attempts}). ` +
          `Reintentando en ${Math.round(retryDelayMs / 1000)}s. Causa: ${detail}`,
      );
      setTimeout(() => void attempt(), retryDelayMs).unref();
    }
  };

  void attempt();
}

export function getDatabaseError(): string | null {
  return lastConnectionError;
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
