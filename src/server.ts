import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './shared/logger';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`API GatroxM.dev escuchando en http://localhost:${env.port}`);
    logger.info(`CORS permitido para: ${env.frontendUrl}`);
    logger.info(`Chat IA: ${env.ai.apiKey ? `proveedor configurado (${env.ai.baseUrl}, modelo ${env.ai.model})` : 'sin clave, usando base de conocimientos local'}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Recibida señal ${signal}, cerrando servidor...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('Servidor cerrado correctamente');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  logger.error('No se pudo iniciar el servidor', error);
  process.exit(1);
});
