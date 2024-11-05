import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { User } from '../users/user.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('create')
  async createRoom(@Body() body: { name: string }, @Request() req: { user: User }) {
    return this.roomsService.createRoom(body.name, req.user);
  }

  @Get(':name')
  async getRoom(@Body('name') name: string) {
    return this.roomsService.getRoomByName(name);
  }

  @Post('join')
  async joinRoom(@Body('roomName') roomName: string, @Body('userId') userId: number) {
    return this.roomsService.joinRoom(roomName, userId);
  }


  @Get()
  async getAllRooms() {
    return this.roomsService.findAllRooms();
  }
}
