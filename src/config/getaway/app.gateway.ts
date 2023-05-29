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
  connectedUsers: { [userId: string]: any } = {};

  handleDisconnect(client: any) {
    const { emissorId } = client['user'];
    // Remover o usuário da lista de usuários conectados
    delete this.connectedUsers[emissorId];

    // Emitir a lista atualizada de usuários conectados para os clientes restantes
    this.server.emit('connectedUsers', Object.values(this.connectedUsers));

    this.logger.log(`Disconnected ${client.id} - User ID: ${emissorId}`);
  }

  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
    this.logger.log('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    const { emissorId, emissorName } = client['user'];
    if (!emissorId) {
      const errorMessage = 'Token inválido ou expirado';
      client.send('exception', errorMessage);
      client.disconnect();
      return;
    }
    // Adicione o usuário à lista de usuários conectados
    this.connectedUsers[emissorId] = { id: emissorId, name: emissorName };
    this.logger.log(`Connected ${client.id} - User ID: ${emissorId}`);
    this.server.emit('connectedUsers', Object.values(this.connectedUsers));
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

  @SubscribeMessage('getConnectedUsers')
  getConnectedUsers(client: any): any {
    // Obtenha a lista de usuários conectados como um array
    this.server.emit('connectedUsers', Object.values(this.connectedUsers));
  }
}
