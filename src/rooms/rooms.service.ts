import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RoomsService {
  constructor(@InjectRepository(Room) private roomsRepository: Repository<Room>) {}

  async createRoom(name: string, owner: User): Promise<Room> {
    const room = this.roomsRepository.create({ name, owner });
    return this.roomsRepository.save(room);
  }

  async findAllRooms(): Promise<Room[]> {
    return this.roomsRepository.find({ relations: ['owner'] });
  }
}
