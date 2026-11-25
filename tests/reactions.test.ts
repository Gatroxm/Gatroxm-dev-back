import { describe, expect, it } from 'vitest';
import {
  countsFromRows,
  hashIp,
  nextAction,
  parseVisitorId,
  totalFromCounts,
} from '../src/modules/blog/reaction.service';
import { emptyCounts } from '../src/modules/blog/reaction.types';

describe('nextAction', () => {
  it('crea la reacción si el visitante no tenía ninguna', () => {
    expect(nextAction(null, 'like')).toBe('create');
  });

  it('quita la reacción si repite el mismo tipo (toggle)', () => {
    expect(nextAction('love', 'love')).toBe('remove');
  });

  it('cambia la reacción si elige otra distinta', () => {
    expect(nextAction('like', 'haha')).toBe('update');
  });
});

describe('countsFromRows', () => {
  it('agrupa los tipos conocidos y deja el resto en cero', () => {
    const counts = countsFromRows([
      { _id: 'like', count: 4 },
      { _id: 'love', count: 2 },
      { _id: 'desconocido', count: 9 },
    ]);

    expect(counts.like).toBe(4);
    expect(counts.love).toBe(2);
    expect(counts.haha).toBe(0);
    expect(counts.angry).toBe(0);
    expect(totalFromCounts(counts)).toBe(6);
  });
});

describe('emptyCounts', () => {
  it('incluye las seis reacciones en cero', () => {
    expect(emptyCounts()).toEqual({ like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 });
  });
});

describe('parseVisitorId', () => {
  it('acepta un UUID sin guiones', () => {
    expect(parseVisitorId('9f1c2d3e4a5b6c7d8e9f0a1b2c3d4e5f')).toBe(
      '9f1c2d3e4a5b6c7d8e9f0a1b2c3d4e5f',
    );
  });

  it('rechaza valores vacíos, cortos o con caracteres raros', () => {
    expect(parseVisitorId('')).toBeNull();
    expect(parseVisitorId('abc')).toBeNull();
    expect(parseVisitorId('id con espacios')).toBeNull();
    expect(parseVisitorId(undefined)).toBeNull();
  });
});

describe('hashIp', () => {
  it('es estable y no contiene la IP original', () => {
    const hash = hashIp('190.1.2.3', 'secret');
    expect(hash).toHaveLength(32);
    expect(hash).not.toContain('190.1.2.3');
    expect(hashIp('190.1.2.3', 'secret')).toBe(hash);
  });

  it('cambia si cambia la sal', () => {
    expect(hashIp('190.1.2.3', 'secret')).not.toBe(hashIp('190.1.2.3', 'otro'));
  });

  it('devuelve cadena vacía si no hay IP', () => {
    expect(hashIp(undefined, 'secret')).toBe('');
  });
});
