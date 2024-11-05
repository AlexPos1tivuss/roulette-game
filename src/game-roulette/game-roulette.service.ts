import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class GameRouletteService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({ host: '127.0.0.1', port: 6379 });
  }

  private sectors = [
    { color: 'green', multiplier: 7 },
    { color: 'black', multiplier: 2 },
    { color: 'red', multiplier: 2 },
  ];

  calculateProbability() {
    const N = 15; 
    const z = 1;  
    const r = (N - z) / 2; 
    const b = (N - z) / 2; 
    const c = 2; 

    return {
      red: r / N,
      black: b / N,
      green: z / N,
      neighbor: c / N,
    };
  }

  private users = {};
  private rooms = {};

  async register(username: string) {
    if (this.users[username]) {
      return { success: false, message: 'Username exists' };
    }
    this.users[username] = { balance: 1000 };
    return { success: true, message: 'User registered' };
  }

  async login(username: string) {
    if (!this.users[username]) {
      return { success: false, message: 'User null' };
    }
    return { success: true, message: 'User logged in', user: this.users[username] };
  }

  async createRoom(username: string, roomName: string) {
    if (this.rooms[roomName]) {
      return { success: false, message: 'Room exists' };
    }
    this.rooms[roomName] = { owner: username, players: [username] };
    return { success: true, message: 'Room created' };
  }

  async placeBet(betData: { color: string; amount: number }) {
    const spinResult = this.spinRoulette();
    const winAmount = spinResult.color === betData.color ? betData.amount * spinResult.multiplier : 0;
    await this.saveResult(spinResult);
    return { winAmount, spinResult };
  }

  private spinRoulette() {
    const randomIndex = Math.floor(Math.random() * this.sectors.length);
    return this.sectors[randomIndex];
  }

  private async saveResult(result: { color: string }) {
    const history = await this.getHistory();
    if (history.length >= 17) {
      history.shift();
    }
    history.push(result);
    await this.redisClient.set('roulette:history', JSON.stringify(history));
  }

  async getHistory() {
    const history = await this.redisClient.get('roulette:history');
    return history ? JSON.parse(history) : [];
  }
}
