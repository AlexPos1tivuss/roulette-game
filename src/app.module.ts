import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users/users.service';
import { User } from './users/user.entity';
import { Room } from './rooms/room.entity';
import { RoomsService } from './rooms/rooms.service';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsGateway } from './rooms/rooms.gateway';
import { GameRouletteGateway } from './game-roulette/game-roulette.gateway';
import { GameRouletteService } from './game-roulette/game-roulette.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '789159',
      database: 'postgres',
      entities: [User, Room],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User, Room]),
  ],
  controllers: [AuthController, RoomsController],
  providers: [AuthService, UsersService, RoomsService, RoomsGateway, GameRouletteGateway, GameRouletteService],
})
export class AppModule {}
