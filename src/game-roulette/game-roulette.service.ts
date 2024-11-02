import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class GameRouletteService {
  private redisClient = new Redis();

  constructor() {
    this.redisClient = new Redis({ host: '127.0.0.1', port: 6379 });
  }

  private sectors = [
    { color: 'green', multiplier: 7 },
    { color: 'black', multiplier: 2 },
    { color: 'red', multiplier: 2 },
  ];

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
      history.shift(); // Удаляем старейший элемент
    }
    history.push(result);
    await this.redisClient.set('roulette:history', JSON.stringify(history));
  }

  async getHistory() {
    const history = await this.redisClient.get('roulette:history');
    return history ? JSON.parse(history) : [];
  }
}
