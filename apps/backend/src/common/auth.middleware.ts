import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { checkAuth } from './auth';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (checkAuth()) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }
} 