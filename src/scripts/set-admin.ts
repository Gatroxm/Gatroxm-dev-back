import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { logger } from '../shared/logger';
import { AdminUserModel } from '../modules/auth/admin-user.model';

async function run() {
  await connectDatabase();
  const username = env.adminUsername.toLowerCase();
  const password = env.adminPassword;
  if (!username || !password) {
    throw new Error('ADMIN_USERNAME y ADMIN_PASSWORD deben estar definidos en .env');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUserModel.updateOne(
    { username },
    { $set: { username, passwordHash, role: 'admin' } },
    { upsert: true },
  );

  // Eliminar usuario admin anterior por defecto si es distinto
  if (username !== 'admin') {
    await AdminUserModel.deleteOne({ username: 'admin' });
  }

  logger.info(`Usuario admin configurado: ${username}`);
  await disconnectDatabase();
}

run().catch((e) => {
  logger.error('Error configurando admin', e);
  process.exit(1);
});
