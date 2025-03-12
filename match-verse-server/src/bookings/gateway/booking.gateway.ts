import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
  WebSocketGateway
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class BookingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{

    @WebSocketServer() socket:Server;
  handleConnection(client: any, ...args: any[]) {
    console.log('socket connected');
  }
  handleDisconnect(client: any) {
    console.log('socket disconnected');
  }
  afterInit(server: any) {
    console.log('Socket Created');
  }

  emitEventUpdate(){
    this.socket.emit("booking updated");

  }
}

