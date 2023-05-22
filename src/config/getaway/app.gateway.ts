import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  handleDisconnect(client: any) {
    this.logger.log(`Disconect ${client.id}`);
  }
  afterInit(server: any) {
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
