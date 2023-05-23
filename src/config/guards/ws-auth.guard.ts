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
    wsAuthGuard.validateToken(client);

    return true;
  }

  static validateToken(client: Socket) {
    const { authorization } = client.handshake.headers;
    const token: string = authorization.split(' ')[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      return payload;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else {
        throw new UnauthorizedException(err?.message);
      }
    }
  }
}
