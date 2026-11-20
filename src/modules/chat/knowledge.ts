/**
 * Base de conocimientos construida a partir de datos reales del portafolio.
 * Se usa para:
 *  - Dar contexto al LLM (si hay AI_API_KEY configurada)
 *  - Responder localmente cuando no hay proveedor de IA (source: 'knowledge')
 */
import {
  educationFallback,
  experienceFallback,
  experienceNote,
  profileFallback,
  projectsFallback,
  skillsFallback,
} from '../../data/fallback';

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
    `Nota: ${experienceNote}`,
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
      suggestions: ['¿Cuál es tu experiencia?', '¿Qué proyectos has hecho?', '¿Trabajas con IA?'],
    };
  }

  if (includesAny(q, ['experiencia', 'trabajo', 'empresas', 'trayectoria', 'cargo', 'años', 'anos', 'aperce', 'santander'])) {
    const top = experienceFallback.slice(0, 4).map((e) => `- ${e.role} en ${e.company} (${e.period})`);
    return {
      answer: `Gustavo tiene más de 12 años de experiencia. Algunos roles recientes:\n${top.join('\n')}\n\nNota: ${experienceNote}`,
      suggestions: ['¿Qué tecnologías dominas?', 'Háblame de tus proyectos', '¿Trabajas con IA?'],
    };
  }

  if (includesAny(q, ['tecnolog', 'stack', 'skill', 'habilidad', 'frontend', 'backend', 'angular', 'react', '.net', 'node', 'bases de datos', 'cloud', 'azure'])) {
    const groups = skillsFallback.map((g) => `- ${g.category}: ${g.items.slice(0, 8).join(', ')}${g.items.length > 8 ? ', …' : ''}`);
    return {
      answer: `Stack tecnológico (según la hoja de vida):\n${groups.join('\n')}`,
      suggestions: ['¿Tienes experiencia con .NET y Angular?', '¿Qué sabes de arquitectura?', '¿Cómo puedo contactarte?'],
    };
  }

  if (includesAny(q, ['ia', 'ai', 'agente', 'agentes', 'mcp', 'graphify', 'langchain', 'langgraph', 'rag', 'inteligencia', 'llm'])) {
    return {
      answer: `Gustavo trabaja con IA aplicada al desarrollo: diseña y construye agentes de IA conectados a MCP y Graphify para agilizar requerimientos (consumiendo menos tokens). En una demostración con unos 58 desarrolladores, un requerimiento de cerca de una semana se resolvió en un día. También ha construido prototipos con LangChain y evaluado Pinecone y pgvector para búsqueda semántica (RAG).`,
      suggestions: ['¿Cuál es tu experiencia reciente?', '¿Qué proyectos de IA tienes?', '¿Cómo puedo contactarte?'],
    };
  }

  if (includesAny(q, ['proyecto', 'proyectos', 'portafolio', 'portfolio', 'suramericana', 'argos', 'banco', 'cotizador'])) {
    const list = projectsFallback.map((p) => `- ${p.title}: ${p.summary}`);
    return {
      answer: `Proyectos destacados (según experiencia y este portafolio):\n${list.join('\n')}`,
      suggestions: ['Cuéntame del proyecto con Santander', '¿Trabajas con IA?', '¿Cuál es tu stack?'],
    };
  }

  if (includesAny(q, ['arquitectura', 'microservicio', 'micro-frontend', 'microfrontend', 'ddd', 'clean', 'limpia', 'diseño'])) {
    return {
      answer: `En arquitectura de software, Gustavo ha liderado micro-frontends (Next.js en el proyecto del Banco Santander Chile) y microservicios (Java, Node.js/Express, Next.js), y trabaja con arquitectura limpia, DDD, APIs REST seguras, CI/CD y despliegues en Azure. No se muestran métricas inventadas; los detalles provienen de su experiencia documentada.`,
      suggestions: ['¿Cuál es tu experiencia?', '¿Qué tecnologías usas?', '¿Trabajas con IA?'],
    };
  }

  if (includesAny(q, ['educación', 'educacion', 'estudio', 'título', 'titulo', 'sena', 'certificación', 'certificacion', 'curso', 'cursos', 'idioma', 'inglés', 'ingles'])) {
    const edu = educationFallback.map((e) => `- [${e.type}] ${e.title} — ${e.org}${e.year ? ` (${e.year})` : ''}`);
    return {
      answer: `Educación y certificaciones:\n${edu.join('\n')}`,
      suggestions: ['¿Cuál es tu experiencia?', '¿Qué tecnologías dominas?', '¿Cómo puedo contactarte?'],
    };
  }

  if (includesAny(q, ['mascota', 'gx', 'pencil', 'animación', 'animacion'])) {
    return {
      answer: `Gx es la mascota original de GatroxM.dev: un personaje 2D dibujado a mano en blanco, azul eléctrico y navy, animado de forma tradicional con Pencil2D. Representa la curiosidad y la ingeniería detrás del portafolio.`,
      suggestions: ['¿Quién es Gustavo?', '¿Qué tecnologías dominas?', '¿Cómo puedo contactarte?'],
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
