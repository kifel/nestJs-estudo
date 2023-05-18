import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('LoggingMiddleware');

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, originalUrl, method } = req;
    const timestamp = new Date().toISOString();

    this.logger.log(`[${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

    next();
  }
}
