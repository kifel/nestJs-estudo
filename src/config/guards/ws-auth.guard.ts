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

    try {
      const user = wsAuthGuard.validateToken(client);
      const emissorId = user.emissorId;
      const emissorName = user.emissorName;
      const emissor = { id: emissorId, name: emissorName };

      client['user'] = emissor;

      return true;
    } catch (err) {
      client.disconnect();
      throw err;
    }
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    const token: string = authorization.split(' ')[1];

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (typeof decodedToken !== 'object') {
        throw new UnauthorizedException('Invalid token', 'InvalidToken');
      }
      const emissorId = decodedToken.sub;
      const emissorName = decodedToken.name;
      return { emissorId, emissorName };
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired', 'TokenExpired');
      } else {
        throw new UnauthorizedException(err?.message);
      }
    }
  }
}
