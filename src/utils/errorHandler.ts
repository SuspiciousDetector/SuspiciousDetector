import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error:', err);

  res.status(500).json({
    message: 'An unexpected error occurred'
  });
}