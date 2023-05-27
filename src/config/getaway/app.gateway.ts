import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UnauthorizedExceptionFilter } from '../filter/websocket-exceptions.filter';
import { wsAuthGuard } from '../guards/ws-auth.guard';
import { SocketAuthMiddleware } from '../middleware/ws.middleware';

@WebSocketGateway({
  cors: {
    origin: true,
  },
})
@UseGuards(wsAuthGuard)
@UseFilters(UnauthorizedExceptionFilter)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  handleDisconnect(client: any) {
    const { emissorId } = client['user'];
    this.logger.log(`Disconnected ${client.id} - User ID: ${emissorId}`);
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
    this.logger.log('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    const { emissorId } = client['user'];
    if (!emissorId) {
      const errorMessage = 'Token inválido ou expirado';
      client.send('exception', errorMessage); // Envia mensagem de erro para o cliente
      client.disconnect(); // Desconecta o cliente
      return;
    }
    this.logger.log(`Connected ${client.id} - User ID: ${emissorId}`);
  }

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: any, payload: any): void {
    const emissor = client['user'];
    const emissorId = emissor.id;
    const emissorName = emissor.name;

    const messageWithEmissor = { emissorId, emissorName, payload };
    this.server.emit('msgToClient', messageWithEmissor);
  }
}
