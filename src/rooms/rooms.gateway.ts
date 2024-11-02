import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

@WebSocketGateway({ namespace: 'rooms' })
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {
    client.join(`room-${roomId}`);
    this.server.to(`room-${roomId}`).emit('message', `User ${client.id} joined room ${roomId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: number, @ConnectedSocket() client: Socket) {
    client.leave(`room-${roomId}`);
    this.server.to(`room-${roomId}`).emit('message', `User ${client.id} left room ${roomId}`);
  }
}
