import { RequestHandler } from 'express';

/** Envuelve un handler async y reenvía cualquier rechazo al middleware de errores. */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
