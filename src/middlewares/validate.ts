import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';
import { AppError } from '../shared/AppError';

type Target = 'body' | 'query' | 'params';

/** Valida y reemplaza la parte indicada de la request con los datos parseados. */
export function validate(schema: ZodTypeAny, target: Target = 'body'): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new AppError(400, 'Datos inválidos', result.error.issues));
    }
    (req as unknown as Record<Target, unknown>)[target] = result.data;
    next();
  };
}
