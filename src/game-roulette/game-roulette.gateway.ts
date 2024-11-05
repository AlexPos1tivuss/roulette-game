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
import Redis from 'ioredis';

@WebSocketGateway({
  transports: ['websocket'],
  namespace: 'game-roulette',
  cors: {
    credentials: true,
    exposedHeaders: ['set-cookie'],
    methods: ['GET', 'OPTIONS'],
  },
  cookie: {
    httpOnly: true,
    path: '/game-roulette',
    secure: true,
    sameSite: 'Strict',
  },
})
export class GameRouletteGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private redisClient = new Redis();

  constructor(private readonly gameRouletteService: GameRouletteService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('connectionStatus', { message: 'Connected to game' });
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  async handleRegister(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket) {
    const result = await this.gameRouletteService.register(data.username);
    client.emit('registerResponse', result);
  }

  @SubscribeMessage('login')
  async handleLogin(@MessageBody() data: { username: string }, @ConnectedSocket() client: Socket) {
    const result = await this.gameRouletteService.login(data.username);
    client.emit('loginResponse', result);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@MessageBody() data: { username: string; roomName: string }, @ConnectedSocket() client: Socket) {
    const result = await this.gameRouletteService.createRoom(data.username, data.roomName);
    client.emit('createRoomResponse', result);
  }

  @SubscribeMessage('placeBet')
  async handleBet(@MessageBody() betData: { color: string; amount: number }, @ConnectedSocket() client: Socket) {
    const result = await this.gameRouletteService.placeBet(betData);
    await this.addToHistory(result);
    client.emit('betResult', result);
    this.server.emit('updateHistory', await this.getHistory());
  }

  async addToHistory(data: any) {
    await this.redisClient.lpush('game-history', JSON.stringify(data));
    await this.redisClient.ltrim('game-history', 0, 16);
  }

  async getHistory() {
    return await this.redisClient.lrange('game-history', 0, -1);
  }


  @SubscribeMessage('runTest')
  async handleTest(@ConnectedSocket() client: Socket) {
    const username = 'testUser';
    const roomName = 'testRoom';

    const registerResult = await this.gameRouletteService.register(username);
    client.emit('testRegister', registerResult);

    const loginResult = await this.gameRouletteService.login(username);
    client.emit('testLogin', loginResult);

    if (!loginResult.success) {
      return client.emit('testResults', { success: false, message: 'Login failed' });
    }

    const roomResult = await this.gameRouletteService.createRoom(username, roomName);
    client.emit('testCreateRoom', roomResult);

    if (!roomResult.success) {
      return client.emit('testResults', { success: false, message: 'Room failed' });
    }

    const bets = [
      { color: 'red', amount: 100 },
      { color: 'black', amount: 150 },
      { color: 'green', amount: 50 },
    ];

    const betResults = [];
    for (const bet of bets) {
      const result = await this.gameRouletteService.placeBet(bet);
      betResults.push(result);
      await this.addToHistory(result);
    }

    client.emit('testResults', {
      success: true,
      register: registerResult,
      login: loginResult,
      createRoom: roomResult,
      bets: betResults,
      history: await this.getHistory(),
    });
  }
}
