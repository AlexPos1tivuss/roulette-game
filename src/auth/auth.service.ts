import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(username: string, password: string): Promise<User> {
    const existingUser = await this.usersService.findByUsername(username);
    if (existingUser) throw new BadRequestException('Имя пользователя уже существует');
    return this.usersService.createUser(username, password);
  }

  async login(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user || user.password !== password) throw new BadRequestException('Неверные данные');
    return user;
  }
}
