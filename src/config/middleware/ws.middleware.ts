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
      client['user'] = user; // Define o usuário no cliente conectado
      next();
    } catch (err) {
      if (err.message === 'jwt expired') {
        client.send('exception', 'Token expired'); // Enviar mensagem de erro para o cliente
        next(new UnauthorizedException('Token expired'));
      } else {
        next(err);
      }
    }
  };
};
