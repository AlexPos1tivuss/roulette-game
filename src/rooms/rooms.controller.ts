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

  @Get()
  async getAllRooms() {
    return this.roomsService.findAllRooms();
  }
}
