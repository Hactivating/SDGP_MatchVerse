import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@Gateway()
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
function Gateway(): (target: typeof BookingGateway) => void | typeof BookingGateway {
    throw new Error('Function not implemented.');
}

