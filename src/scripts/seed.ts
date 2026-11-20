/**
 * Semilla idempotente: inserta datos reales de la hoja de vida si las colecciones están vacías.
 * No inventa información. También crea el usuario admin si se proporciona ADMIN_PASSWORD.
 * Ejecutar: npm.cmd run seed
 */
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { env } from '../config/env';
import { logger } from '../shared/logger';
import { ProfileModel } from '../modules/profile/profile.model';
import { ProjectModel } from '../modules/projects/project.model';
import { ExperienceModel } from '../modules/experience/experience.model';
import { SkillGroupModel } from '../modules/skills/skill.model';
import { EducationModel } from '../modules/education/education.model';
import { AdminUserModel } from '../modules/auth/admin-user.model';
import {
  educationFallback,
  experienceFallback,
  profileFallback,
  projectsFallback,
  skillsFallback,
} from '../data/fallback';

async function seed(): Promise<void> {
  await connectDatabase();
  logger.info('Iniciando semilla de datos reales...');

  const [profileCount, projectsCount, expCount, skillsCount, eduCount] = await Promise.all([
    ProfileModel.countDocuments(),
    ProjectModel.countDocuments(),
    ExperienceModel.countDocuments(),
    SkillGroupModel.countDocuments(),
    EducationModel.countDocuments(),
  ]);

  if (profileCount === 0) {
    await ProfileModel.create({ key: 'main', ...profileFallback });
    logger.info('Perfil creado');
  } else {
    logger.info('Perfil ya existe; se omite');
  }

  if (projectsCount === 0) {
    await ProjectModel.insertMany(projectsFallback);
    logger.info(`${projectsFallback.length} proyectos creados`);
  } else {
    logger.info(`Proyectos ya existen (${projectsCount}); se omite`);
  }

  if (expCount === 0) {
    await ExperienceModel.insertMany(experienceFallback.map(({ id, ...rest }) => rest));
    logger.info(`${experienceFallback.length} registros de experiencia creados`);
  } else {
    logger.info(`Experiencia ya existe (${expCount}); se omite`);
  }

  if (skillsCount === 0) {
    await SkillGroupModel.insertMany(skillsFallback.map(({ id, ...rest }) => rest));
    logger.info(`${skillsFallback.length} grupos de habilidades creados`);
  } else {
    logger.info(`Habilidades ya existen (${skillsCount}); se omite`);
  }

  if (eduCount === 0) {
    await EducationModel.insertMany(educationFallback.map(({ id, ...rest }) => rest));
    logger.info(`${educationFallback.length} registros educativos/certificaciones creados`);
  } else {
    logger.info(`Educación ya existe (${eduCount}); se omite`);
  }

  if (env.adminPassword) {
    const existing = await AdminUserModel.findOne({ username: env.adminUsername.toLowerCase() });
    if (!existing) {
      const passwordHash = await bcrypt.hash(env.adminPassword, 12);
      await AdminUserModel.create({
        username: env.adminUsername.toLowerCase(),
        passwordHash,
        role: 'admin',
      });
      logger.info(`Usuario admin '${env.adminUsername}' creado`);
    } else {
      logger.info(`Usuario admin '${env.adminUsername}' ya existe; se omite`);
    }
  } else {
    logger.warn('ADMIN_PASSWORD vacío: no se creó usuario admin en la base de datos (el login por env seguirá disponible si se define luego).');
  }

  logger.info('Semilla completada.');
  await disconnectDatabase();
}

seed().catch((error) => {
  logger.error('Error en la semilla', error);
  process.exit(1);
});
