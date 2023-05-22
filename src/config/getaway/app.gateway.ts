import { Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { wsAuthGuard } from '../guards/ws-auth.guard';
import { SocketAuthMiddleware } from '../middleware/ws.middleware';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:5500',
  },
})
@UseGuards(wsAuthGuard)
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  handleDisconnect(client: any) {
    this.logger.log(`Disconect ${client.id}`);
  }
  afterInit(client: Socket) {
    client.use(SocketAuthMiddleware() as any);
    this.logger.log('Init');
  }
  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Connection ${client.id}`);
  }
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: any, payload: any): void {
    this.server.emit('msgToClient', payload, client.id);
  }
}
