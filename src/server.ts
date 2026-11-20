import { writeSync } from 'node:fs';
import { env } from './config/env';
import { startDatabaseConnection, disconnectDatabase } from './config/database';
import { logger } from './shared/logger';
import { createApp } from './app';

function bootstrap(): void {
  // Arrancamos el servidor HTTP primero: Render detecta el puerto abierto
  // y el servicio no entra en bucle de reinicios si MongoDB tarda o falla.
  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`API GatroxM.dev escuchando en el puerto ${env.port}`);
    logger.info(`Entorno: ${env.nodeEnv} | CORS permitido para: ${env.frontendUrl}`);
    logger.info(
      `Chat IA: ${
        env.ai.apiKey
          ? `proveedor configurado (${env.ai.baseUrl}, modelo ${env.ai.model})`
          : 'sin clave, usando base de conocimientos local'
      }`,
    );
  });

  server.on('error', (error) => {
    writeSync(2, `\n[FATAL] El servidor no pudo abrir el puerto ${env.port}: ${error.message}\n`);
    process.exit(1);
  });

  startDatabaseConnection();

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

try {
  bootstrap();
} catch (error) {
  // writeSync evita que el mensaje se pierda cuando Render corta el proceso.
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  writeSync(2, `\n[FATAL] No se pudo iniciar el servidor: ${detail}\n`);
  writeSync(
    2,
    'Revisa las variables de entorno (MONGODB_URI, JWT_SECRET) y que MongoDB Atlas permita el acceso desde Render.\n',
  );
  process.exit(1);
}
