import { Socket } from 'socket.io';
import { wsAuthGuard } from '../guards/ws-auth.guard';

export type SocketIOMiddleWare = {
  (cliente: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (): SocketIOMiddleWare => {
  return (cliente, next) => {
    try {
      wsAuthGuard.validateToken(cliente);
      next();
    } catch (err) {
      next(err);
    }
  };
};
