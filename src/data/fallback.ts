/**
 * Datos derivados de la hoja de vida real de Gustavo Adolfo Muñoz Reyes.
 * Fuente: E:\Gatroxm.github.io\src\data\content.ts (copia en portfolio-content.ts).
 * Regla del proyecto: NO inventar experiencia, métricas ni certificaciones.
 * Estos datos se usan para sembrar MongoDB y como respaldo si la base está vacía.
 */
import {
  about,
  contact,
  courses,
  education as rawEducation,
  experience as rawExperience,
  profile as rawProfile,
  resumeHref,
  skills,
  stats,
} from './portfolio-content';
import type {
  EducationItem,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from '../shared/types';

export const experienceNote = rawExperience.note;

export const profileFallback: Profile = {
  name: rawProfile.name,
  brand: rawProfile.brand,
  roles: rawProfile.roles,
  title: rawProfile.title,
  location: rawProfile.location,
  lead: rawProfile.lead,
  stats,
  about,
  contact,
  resumeHref,
};

export const projectsFallback: Project[] = [
  {
    slug: 'plan-elige-suramericana',
    title: 'Plan Elige — Suramericana',
    summary: 'Plataforma para cotizar, comparar y seleccionar planes.',
    description:
      'Proyecto desarrollado en Grupo FG para Suramericana: una plataforma que permite cotizar, comparar y seleccionar planes. Frontend con Angular 12 y Vue.js; APIs con Node.js y MongoDB.',
    category: 'web',
    tags: ['Angular 12', 'Vue', 'Node.js', 'MongoDB'],
    featured: true,
    links: {},
    media: { poster: 'assets/images/projects/plan-elige.svg' },
    order: 1,
  },
  {
    slug: 'cotizador-cementos-argos',
    title: 'Cotizador digital — Cementos Argos',
    summary: 'Cotizador digital con arquitectura, lógica de negocio y visualización.',
    description:
      'Proyecto en Strategee: cotizador digital para Cementos Argos, a cargo de la arquitectura, la lógica de negocio y la visualización. Stack: Angular 10, C# y CakePHP.',
    category: 'web',
    tags: ['Angular 10', 'C#', 'CakePHP'],
    featured: false,
    links: {},
    media: { poster: 'assets/images/projects/cotizador-argos.svg' },
    order: 2,
  },
  {
    slug: 'app-inversiones-santander-chile',
    title: 'App de inversiones — Banco Santander Chile',
    summary: 'Frontend de una aplicación móvil de inversiones para un banco de Chile.',
    description:
      'En Imagemaker lideré el frontend de una aplicación móvil de inversiones para el Banco Santander de Chile. Implementé micro-frontends con Next.js para que equipos paralelos desplegaran de forma independiente y colaboré en el despliegue en tiendas bajo estándares de seguridad bancaria.',
    category: 'architecture',
    tags: ['Angular 15/16', 'Micro-frontends', 'Next.js'],
    featured: true,
    links: {},
    media: { poster: 'assets/images/projects/santander.svg' },
    order: 3,
  },
  {
    slug: 'asistente-ia-langchain',
    title: 'Asistente de IA con LangChain',
    summary: 'Prototipo de asistente de IA con búsqueda semántica.',
    description:
      'En UX Technology construí un prototipo de asistente de IA con LangChain y evalué Pinecone y pgvector para búsqueda semántica, sobre microservicios en Node.js con AWS DynamoDB.',
    category: 'ai',
    tags: ['LangChain', 'Pinecone', 'pgvector', 'Node.js'],
    featured: true,
    links: {},
    media: { poster: 'assets/images/projects/asistente-ia.svg' },
    order: 4,
  },
  {
    slug: 'agentes-ia-requerimientos',
    title: 'Agentes de IA para requerimientos',
    summary: 'Agentes conectados a MCP y Graphify para acelerar requerimientos.',
    description:
      'En APERCE diseñé y construí agentes de IA que agilizan la creación e implementación de requerimientos, conectados a Graphify para consumir menos tokens. La demostración se hizo con unos 58 desarrolladores: un requerimiento de cerca de una semana se resolvió en un día.',
    category: 'ai',
    tags: ['Agentes de IA', 'MCP', 'Graphify', 'Azure'],
    featured: true,
    links: {},
    media: { poster: 'assets/images/projects/agentes-ia.svg' },
    order: 5,
  },
  {
    slug: 'gatroxm-dev-portafolio',
    title: 'GatroxM.dev — Portafolio interactivo',
    summary: 'Portafolio profesional con mascota animada, API propia y chatbot con IA.',
    description:
      'Este sitio: Angular en el frontend, Node.js + Express + TypeScript en el backend y MongoDB Atlas como base de datos. Incluye una mascota original animada en Pencil2D y un chatbot que responde con datos reales de la hoja de vida.',
    category: 'web',
    tags: ['Angular', 'Node.js', 'Express', 'TypeScript', 'MongoDB'],
    featured: false,
    links: {},
    media: { poster: 'assets/images/projects/gatroxm.svg' },
    order: 6,
  },
];

export const experienceFallback: Experience[] = rawExperience.jobs.map((job, index) => ({
  id: `exp-${index + 1}`,
  role: job.role,
  company: job.company,
  period: job.period,
  tags: job.tags,
  bullets: job.bullets,
  order: index + 1,
}));

export const skillsFallback: SkillGroup[] = Object.entries(skills).map(
  ([category, items], index) => ({
    id: `skill-${index + 1}`,
    category,
    items,
    order: index + 1,
  }),
);

export const educationFallback: EducationItem[] = [
  ...rawEducation.map((item, index) => ({
    id: `edu-${index + 1}`,
    type: item.title === 'Idiomas' ? ('language' as const) : ('education' as const),
    title: item.title,
    org: item.org,
    year: item.year,
    order: index + 1,
  })),
  ...courses.map((course, index) => ({
    id: `cert-${index + 1}`,
    type: 'certification' as const,
    title: course.title,
    org: course.org,
    year: course.year,
    href: course.href,
    order: 100 + index,
  })),
];
