/**
 * Base de conocimientos construida a partir de datos reales del portafolio.
 * Se usa para:
 *  - Dar contexto al LLM (si hay AI_API_KEY configurada)
 *  - Responder localmente cuando no hay proveedor de IA (source: 'knowledge')
 *
 * Regla del proyecto: no inventar experiencia, métricas ni certificaciones.
 * Todas las respuestas se refieren a Gustavo en tercera persona.
 */
import {
  educationFallback,
  experienceFallback,
  profileFallback,
  projectsFallback,
  skillsFallback,
} from '../../data/fallback';

/** Nota corregida de periodos cruzados (voz en tercera persona). */
export const EXPERIENCE_NOTE =
  'Nota: en algunos periodos (2015–2016 y 2019–2021) Gustavo combinó contratos a término fijo y proyectos como freelancer, sin cláusula de exclusividad.';

/** Respuesta verificada para .NET y C#. */
export const DOTNET_EXPERIENCE =
  'Gustavo tiene cerca de 1 año como stack principal con C# y .NET (desde septiembre de 2025, en BTW SAS y en su cargo actual con .NET 8 y 10), más experiencia puntual en C# entre 2016 y 2019. En total lleva más de 12 años como desarrollador full stack.';

export function buildKnowledgeText(): string {
  const p = profileFallback;

  const lines: string[] = [
    `Nombre: ${p.name}`,
    `Título: ${p.title}`,
    `Ubicación: ${p.location}`,
    `Resumen: ${p.lead}`,
    `Roles: ${p.roles.join(', ')}`,
    '',
    'Estadísticas:',
    ...p.stats.map((s) => `- ${s.label}: ${s.value ?? s.text ?? ''}${s.suffix ?? ''}`.trim()),
    '',
    'Sobre mí:',
    ...p.about.paragraphs.map((x) => `- ${x}`),
    '',
    'Flujo de trabajo con IA:',
    ...p.about.flow.map((s) => `- ${s.title}: ${s.text}`),
    '',
    'Experiencia profesional:',
    EXPERIENCE_NOTE,
    ...experienceFallback.flatMap((e) => [
      `- ${e.role} en ${e.company} (${e.period})`,
      `  Tecnologías: ${e.tags.join(', ')}`,
      ...e.bullets.map((b) => `  • ${b}`),
    ]),
    '',
    'Proyectos destacados:',
    ...projectsFallback.flatMap((pr) => [
      `- ${pr.title} [${pr.category}]: ${pr.summary}`,
      `  ${pr.description}`,
      `  Tecnologías: ${pr.tags.join(', ')}`,
    ]),
    '',
    'Stack tecnológico:',
    ...skillsFallback.map((g) => `- ${g.category}: ${g.items.join(', ')}`),
    '',
    'Educación y certificaciones:',
    ...educationFallback.map((e) => {
      const year = e.year ? ` (${e.year})` : '';
      const href = e.href ? ` - ${e.href}` : '';
      return `- [${e.type}] ${e.title} — ${e.org}${year}${href}`;
    }),
    '',
    'Contacto:',
    `- Email: ${p.contact.email}`,
    `- Teléfono: ${p.contact.phone}`,
    `- WhatsApp: ${p.contact.whatsapp}`,
    `- LinkedIn: ${p.contact.linkedin}`,
    `- GitHub: ${p.contact.github}`,
  ];

  return lines.join('\n');
}

const knowledge = buildKnowledgeText().toLowerCase();

export interface Match {
  answer: string;
  suggestions: string[];
}

const defaultSuggestions = [
  '¿Cuál es tu experiencia?',
  '¿Qué tecnologías dominas?',
  '¿Trabajas con agentes de IA?',
  '¿Cómo puedo contactarte?',
];

const techSuggestions = [
  '¿Qué proyectos ha hecho?',
  '¿Cuál es su experiencia total?',
  '¿Cómo puedo contactarlo?',
];

/* ------------------------------------------------------------------ */
/* Normalización de tecnologías                                        */
/* ------------------------------------------------------------------ */

/**
 * Se aplica sobre el texto original (con puntos y símbolos) antes de tokenizar.
 * Variantes reconocidas → token canónico:
 *  - .net, . net, dot net, dotnet, net core, asp.net, c#, c sharp, csharp → dotnet
 *  - node.js, nodejs, node → nodejs
 *  - vue.js, vuejs, vue → vue
 *  - angular js, angularjs, angular → angularjs
 *  - sql server, sqlserver, mssql → sqlserver
 */
const TECH_ALIASES: Array<{ pattern: RegExp; token: string }> = [
  {
    pattern: /(?:asp\.net|\.\s*net|dot\s*net|dotnet|net\s+core|c\s*#|csharp|c\s+sharp)/g,
    token: 'dotnet',
  },
  { pattern: /(?:node\.js|nodejs|\bnode\b)/g, token: 'nodejs' },
  { pattern: /(?:vue\.js|vuejs|\bvue\b)/g, token: 'vue' },
  { pattern: /(?:angular\s*js|angularjs|\bangular\b)/g, token: 'angularjs' },
  { pattern: /(?:sql\s*server|sqlserver|\bmssql\b)/g, token: 'sqlserver' },
];

export function normalizeTechnologies(text: string): string {
  return TECH_ALIASES.reduce(
    (acc, { pattern, token }) => acc.replace(pattern, ` ${token} `),
    text.toLowerCase(),
  );
}

/** Tokeniza el texto ya normalizado (conserva el orden de aparición). */
export function tokenize(text: string): string[] {
  return normalizeTechnologies(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/* ------------------------------------------------------------------ */
/* Respuestas verificadas por tecnología                               */
/* ------------------------------------------------------------------ */

const techExperienceAnswers: Record<string, string> = {
  dotnet: DOTNET_EXPERIENCE,
  nodejs:
    'Gustavo ha trabajado con Node.js en APIs y microservicios: en UX Technology diseñó microservicios con Node.js y AWS DynamoDB; en Grupo FG y SMDigital construyó APIs con Node.js; y en Vortex Bridge y Tuatara usó Express.js y Next.js.',
  vue: 'Gustavo ha trabajado con Vue.js en varios roles: en UX Technology lideró la migración de Vue 2 a Vue 3 y trabajó con Nuxt.js (SSR); también usó Vue.js en Vortex Bridge, Tuatara, Xpectrum, Grupo FG y SMDigital.',
  angularjs:
    'Gustavo tiene experiencia con Angular desde la versión 2 hasta la 19: en su rol actual (APERCE) desarrolla con Angular; en BTW SAS trabajó con Angular 19 e Ionic; y en Vortex Bridge (17/18), Tuatara (16/18), Imagemaker (15/16), Xpectrum (12), Grupo FG (12) y Strategee (10).',
  sqlserver:
    'Gustavo ha trabajado con SQL Server y optimización de consultas: en BTW SAS desarrolló APIs REST con optimización de consultas SQL, y su stack de datos incluye SQL Server, MySQL, PL/SQL y MongoDB. También completó el curso «SQL, curso completo (SQL Server)».',
};

const knownTechTokens = new Set(Object.keys(techExperienceAnswers));

/** Devuelve las tecnologías conocidas detectadas, en orden de aparición. */
export function detectTechnologies(message: string): string[] {
  const found: string[] = [];
  for (const token of tokenize(message)) {
    if (knownTechTokens.has(token) && !found.includes(token)) found.push(token);
  }
  return found;
}

const experienceCues = [
  'experiencia',
  'experience',
  'anos',
  'years',
  'year',
  'tiempo',
  'cuanto',
  'llevas',
  'lleva',
  'how many',
];

function stripAccents(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/** ¿La pregunta pide tiempo/experiencia? (sin distinguir tildes ni mayúsculas) */
export function hasExperienceCue(message: string): boolean {
  const q = ` ${stripAccents(message.toLowerCase())} `;
  return experienceCues.some((cue) => q.includes(cue));
}

/** Intención "experiencia con tecnología X" (solo si hay tecnología + pista de experiencia). */
export function detectTechExperience(message: string): string | null {
  const techs = detectTechnologies(message);
  if (!techs.length || !hasExperienceCue(message)) return null;
  return techs[0];
}

/* ------------------------------------------------------------------ */
/* Respuesta local determinista                                        */
/* ------------------------------------------------------------------ */

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

/** Respuesta local determinista basada en palabras clave. Nunca inventa datos. */
export function answerFromKnowledge(message: string): Match {
  const q = message.toLowerCase();

  if (includesAny(q, ['hola', 'buenas', 'hey', 'saludo', 'hi'])) {
    return {
      answer: `¡Hola! Soy Gx, el asistente de ${profileFallback.name}. Puedo contarte sobre su experiencia, stack, proyectos con IA o cómo contactarlo. ¿Qué te gustaría saber?`,
      suggestions: defaultSuggestions,
    };
  }

  if (includesAny(q, ['contacto', 'contactar', 'email', 'correo', 'whatsapp', 'teléfono', 'telefono', 'linkedin', 'github', 'hablar', 'contratar', 'disponible'])) {
    const c = profileFallback.contact;
    return {
      answer: `Puedes contactar a Gustavo por:\n- Email: ${c.email}\n- WhatsApp: ${c.whatsapp}\n- LinkedIn: ${c.linkedin}\n- GitHub: ${c.github}\n- Teléfono: ${c.phone}\n\nTambién puedes usar el formulario de la sección Contacto de este sitio.`,
      suggestions: ['¿Cuál es su experiencia?', '¿Qué proyectos ha hecho?', '¿Trabaja con IA?'],
    };
  }

  // Prioridad: experiencia con una tecnología concreta (gana a la experiencia total).
  const tech = detectTechExperience(message);
  if (tech) {
    return {
      answer: techExperienceAnswers[tech],
      suggestions: techSuggestions,
    };
  }

  if (includesAny(q, ['experiencia', 'trabajo', 'empresas', 'trayectoria', 'cargo', 'años', 'anos', 'aperce', 'santander'])) {
    const top = experienceFallback.slice(0, 4).map((e) => `- ${e.role} en ${e.company} (${e.period})`);
    return {
      answer: `Gustavo tiene más de 12 años como desarrollador full stack. Algunos roles recientes:\n${top.join('\n')}\n\n${EXPERIENCE_NOTE}`,
      suggestions: ['¿Qué tecnologías domina?', '¿Qué proyectos ha hecho?', '¿Trabaja con IA?'],
    };
  }

  if (includesAny(q, ['tecnolog', 'stack', 'skill', 'habilidad', 'frontend', 'backend', 'angular', 'react', '.net', 'node', 'bases de datos', 'cloud', 'azure'])) {
    const groups = skillsFallback.map((g) => `- ${g.category}: ${g.items.slice(0, 8).join(', ')}${g.items.length > 8 ? ', …' : ''}`);
    return {
      answer: `Stack tecnológico (según la hoja de vida):\n${groups.join('\n')}`,
      suggestions: ['¿Tiene experiencia con .NET y Angular?', '¿Qué sabe de arquitectura?', '¿Cómo puedo contactarlo?'],
    };
  }

  if (includesAny(q, ['ia', 'ai', 'agente', 'agentes', 'mcp', 'graphify', 'langchain', 'langgraph', 'rag', 'inteligencia', 'llm'])) {
    return {
      answer: `Gustavo trabaja con IA aplicada al desarrollo: diseña y construye agentes de IA conectados a MCP y Graphify para agilizar requerimientos (consumiendo menos tokens). En una demostración con unos 58 desarrolladores, un requerimiento de cerca de una semana se resolvió en un día. También ha construido prototipos con LangChain y evaluado Pinecone y pgvector para búsqueda semántica (RAG).`,
      suggestions: ['¿Cuál es su experiencia reciente?', '¿Qué proyectos de IA tiene?', '¿Cómo puedo contactarlo?'],
    };
  }

  if (includesAny(q, ['proyecto', 'proyectos', 'portafolio', 'portfolio', 'suramericana', 'argos', 'banco', 'cotizador'])) {
    const list = projectsFallback.map((p) => `- ${p.title}: ${p.summary}`);
    return {
      answer: `Proyectos destacados (según experiencia y este portafolio):\n${list.join('\n')}`,
      suggestions: ['Cuéntame del proyecto con Santander', '¿Trabaja con IA?', '¿Cuál es su stack?'],
    };
  }

  if (includesAny(q, ['arquitectura', 'microservicio', 'micro-frontend', 'microfrontend', 'ddd', 'clean', 'limpia', 'diseño'])) {
    return {
      answer: `En arquitectura de software, Gustavo ha liderado micro-frontends (Next.js en el proyecto del Banco Santander Chile) y microservicios (Java, Node.js/Express, Next.js), y trabaja con arquitectura limpia, DDD, APIs REST seguras, CI/CD y despliegues en Azure. No se muestran métricas inventadas; los detalles provienen de su experiencia documentada.`,
      suggestions: ['¿Cuál es su experiencia?', '¿Qué tecnologías usa?', '¿Trabaja con IA?'],
    };
  }

  if (includesAny(q, ['educación', 'educacion', 'estudio', 'título', 'titulo', 'sena', 'certificación', 'certificacion', 'curso', 'cursos', 'idioma', 'inglés', 'ingles'])) {
    const edu = educationFallback.map((e) => `- [${e.type}] ${e.title} — ${e.org}${e.year ? ` (${e.year})` : ''}`);
    return {
      answer: `Educación y certificaciones:\n${edu.join('\n')}`,
      suggestions: ['¿Cuál es su experiencia?', '¿Qué tecnologías domina?', '¿Cómo puedo contactarlo?'],
    };
  }

  if (includesAny(q, ['mascota', 'gx', 'pencil', 'animación', 'animacion'])) {
    return {
      answer: `Gx es la mascota original de GatroxM.dev: un personaje 2D dibujado a mano en blanco, azul eléctrico y navy, animado de forma tradicional con Pencil2D. Representa la curiosidad y la ingeniería detrás del portafolio.`,
      suggestions: ['¿Quién es Gustavo?', '¿Qué tecnologías domina?', '¿Cómo puedo contactarlo?'],
    };
  }

  // Búsqueda genérica en el texto de conocimiento
  if (knowledge.includes(q.trim()) && q.trim().length > 3) {
    return {
      answer: `Puedo responder con información de la hoja de vida y el portafolio de Gustavo. ¿Podrías ser más específico? Por ejemplo: experiencia, stack tecnológico, proyectos, IA o contacto.`,
      suggestions: defaultSuggestions,
    };
  }

  return {
    answer: `Soy Gx, el asistente del portafolio de Gustavo Adolfo Muñoz Reyes. Solo puedo responder con información real de su hoja de vida y proyectos: experiencia, stack tecnológico, arquitectura, proyectos, IA, educación y contacto.`,
    suggestions: defaultSuggestions,
  };
}
