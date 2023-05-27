import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class wsAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const user = wsAuthGuard.validateToken(client);
    // Adicionar o nome do emissor ao objeto do emissor
    const emissorId = user.emissorId;
    const emissorName = user.emissorName;
    const emissor = { id: emissorId, name: emissorName };

    client['user'] = emissor; // Associar o usuário ao cliente conectado

    return true;
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    const token: string = authorization.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decodedToken === 'string') {
        throw new UnauthorizedException('Invalid token');
      }
      const emissorId = decodedToken.sub; // Acesso ao ID do emissor
      const emissorName = decodedToken.name; // Acesso ao nome do emissor
      return { payload: decodedToken, emissorId, emissorName };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        client.send('exception', 'Token expired'); // Enviar mensagem de erro para o cliente
        throw new UnauthorizedException('Token expired');
      } else {
        throw new UnauthorizedException(err?.message);
      }
    }
  }
}
