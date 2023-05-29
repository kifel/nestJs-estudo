import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { wsAuthGuard } from '../guards/ws-auth.guard';

export type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return (client, next) => {
    try {
      const user = wsAuthGuard.validateToken(client);
      client['user'] = user;
      next();
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        next(err);
      } else if (err.message === 'jwt expired') {
        next(new UnauthorizedException('Token expired', 'TokenExpired'));
      } else {
        next(new UnauthorizedException(err.message));
      }
    }
  };
};
