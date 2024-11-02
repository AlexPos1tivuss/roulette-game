import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GameRouletteService } from './game-roulette.service';

@Controller('game-roulette')
export class GameRouletteController {
  constructor(private readonly gameRouletteService: GameRouletteService) {}

  @Post('place-bet')
  async placeBet(@Body() betData: { color: string; amount: number }) {
    return this.gameRouletteService.placeBet(betData);
  }
}
