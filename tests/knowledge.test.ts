import { describe, expect, it } from 'vitest';
import {
  DOTNET_EXPERIENCE,
  EXPERIENCE_NOTE,
  answerFromKnowledge,
  detectTechnologies,
  detectTechExperience,
  normalizeTechnologies,
} from '../src/modules/chat/knowledge';

const dotnetQuestions = [
  'Cuantos años de experiencia tienes en. Net.',
  'cuantos años tienes en .net',
  'años de dotnet',
  'experiencia con c#',
  'how many years of .NET experience',
  'tienes experiencia en asp.net',
  'cuanto tiempo llevas con c sharp',
];

const generalExperienceQuestions = [
  'cuantos años de experiencia tienes',
  'háblame de tu experiencia',
];

describe('normalización de tecnologías', () => {
  it.each([
    ['.NET', 'dotnet'],
    ['. net', 'dotnet'],
    ['dot net', 'dotnet'],
    ['dotnet', 'dotnet'],
    ['net core', 'dotnet'],
    ['asp.net', 'dotnet'],
    ['C#', 'dotnet'],
    ['c sharp', 'dotnet'],
    ['csharp', 'dotnet'],
    ['node.js', 'nodejs'],
    ['nodejs', 'nodejs'],
    ['node', 'nodejs'],
    ['vue.js', 'vue'],
    ['vuejs', 'vue'],
    ['angular js', 'angularjs'],
    ['angularjs', 'angularjs'],
    ['sql server', 'sqlserver'],
    ['sqlserver', 'sqlserver'],
    ['mssql', 'sqlserver'],
  ])('convierte "%s" en el token %s', (input, expected) => {
    expect(normalizeTechnologies(input)).toContain(expected);
  });

  it('detecta las tecnologías en orden de aparición', () => {
    expect(detectTechnologies('experiencia con .NET y Angular')).toEqual(['dotnet', 'angularjs']);
  });
});

describe('intención: experiencia con tecnología', () => {
  it.each(dotnetQuestions)('devuelve la respuesta verificada de .NET para: "%s"', (question) => {
    const result = answerFromKnowledge(question);

    expect(result.answer).toBe(DOTNET_EXPERIENCE);
    expect(result.answer).toContain('cerca de 1 año como stack principal con C# y .NET');
    expect(result.answer).toContain('más de 12 años como desarrollador full stack');
  });

  it('la intención específica gana a la experiencia total', () => {
    expect(detectTechExperience('Cuantos años de experiencia tienes en. Net.')).toBe('dotnet');
    expect(detectTechExperience('experiencia con c#')).toBe('dotnet');
    expect(detectTechExperience('cuantos años de experiencia tienes')).toBeNull();
  });
});

describe('intención: experiencia total', () => {
  it.each(generalExperienceQuestions)('devuelve la respuesta general para: "%s"', (question) => {
    const { answer } = answerFromKnowledge(question);

    expect(answer).toContain('más de 12 años como desarrollador full stack');
    expect(answer).not.toContain('cerca de 1 año como stack principal');
    // No mezcla tecnologías concretas con los 12 años.
    expect(answer).not.toMatch(/\b(C#|\.NET|Angular|Node\.js|Vue|SQL Server)\b/);
  });

  it('incluye la nota de periodos cruzados en tercera persona', () => {
    const { answer } = answerFromKnowledge('cuantos años de experiencia tienes');

    expect(answer).toContain(EXPERIENCE_NOTE);
    expect(answer).not.toContain('combiné');
  });
});
