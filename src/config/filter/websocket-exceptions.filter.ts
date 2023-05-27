import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    client.send('exception', 'Token expired'); // Envie uma mensagem de erro para o cliente WebSocket
  }
}
