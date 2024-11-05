import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../users/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createRoom(name: string, owner: User, users: User[] = []): Promise<Room> {
    const room = this.roomsRepository.create({ name, users: [owner, ...users] });
    return this.roomsRepository.save(room);
  }

  async findAllRooms(): Promise<Room[]> {
    return this.roomsRepository.find({ relations: ['owner'] });
  }

  async getRoomByName(name: string): Promise<Room | undefined> {
    return this.roomsRepository.findOne({ where: { name }, relations: ['users'] });
  }

  async joinRoom(roomName: string, userId: number): Promise<Room> {
    const room = await this.getRoomByName(roomName);
    if (!room) {
      throw new Error('Room not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

  
    if (!room.owner.some(u => u.id === user.id)) {
      room.owner.push(user); 
    }
    return this.roomsRepository.save(room);
  }

  async deleteRoom(id: number): Promise<void> {
    await this.roomsRepository.delete(id);
  }
}
