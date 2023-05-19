import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private logger = new Logger('LoggingMiddleware');
  private requestCounts = new Map<
    string,
    { count: number; timestamp: number }
  >();

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();

    // Log do IP e da requisição
    this.logger.log(
      `IP: ${ip} - Method: ${req.method} - URL: ${req.originalUrl}`,
    );

    if (!this.requestCounts.has(ip)) {
      this.requestCounts.set(ip, { count: 1, timestamp: now });
    } else {
      const entry = this.requestCounts.get(ip);
      if (entry.timestamp <= now - 60 * 60 * 1000) {
        // Reinicia a contagem se passou uma hora desde a última requisição
        entry.count = 1;
        entry.timestamp = now;
      } else {
        entry.count++;
      }
    }

    const entry = this.requestCounts.get(ip);
    if (entry.count > 5000) {
      entry.count--; // Diminui 1 do limite
      const remaining = 5000 - entry.count;
      this.logger.warn(
        `IP ${ip} exceeded the rate limit. Remaining: ${remaining}`,
      );
      return res.status(429).json({
        statusCode: 429,
        message: 'Too Many Requests',
        remaining,
      });
    }

    next();
  }
}
