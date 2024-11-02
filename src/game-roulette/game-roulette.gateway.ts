import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { GameRouletteService } from './game-roulette.service';
  
  @WebSocketGateway({
    port: 4000, // Указываем другой порт для WebSocket Gateway
    namespace: 'game-roulette', // Пространство имен
    cors: {
      origin: '*', // Настройка CORS
    },
  })
  export class GameRouletteGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    constructor(private readonly gameRouletteService: GameRouletteService) {}
  
    // Обработчик события подключения
    handleConnection(client: Socket) {
      console.log('Client connected:', client.id);
      client.emit('connectionStatus', { message: 'Connected to game-roulette!' });
    }
  
    // Обработчик события отключения
    handleDisconnect(client: Socket) {
      console.log('Client disconnected:', client.id);
    }
  
    // Обработчик события ставки
    @SubscribeMessage('placeBet')
    async handleBet(@MessageBody() betData: any, @ConnectedSocket() client: Socket) {
      const result = await this.gameRouletteService.placeBet(betData);
      client.emit('betResult', result);
    }
  }
  