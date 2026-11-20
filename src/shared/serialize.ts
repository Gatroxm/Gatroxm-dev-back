/**
 * Convierte un documento de Mongoose (lean o instancia) al formato público:
 * `_id` -> `id`, y elimina `__v` y `key`.
 */
export function serialize<T = Record<string, unknown>>(doc: unknown): T {
  const source = doc as Record<string, unknown>;
  const { _id, __v, key, ...rest } = source;
  return { id: _id ? String(_id) : undefined, ...rest } as T;
}

export function serializeMany<T = Record<string, unknown>>(docs: unknown[]): T[] {
  return docs.map((doc) => serialize<T>(doc));
}
