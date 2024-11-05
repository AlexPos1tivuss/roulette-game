import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const existingUser = await this.usersService.findByUsername(body.username);
    if (existingUser) throw new BadRequestException('Имя пользователя уже существует');
    return this.usersService.createUser(body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.usersService.findByUsername(body.username);
    if (!user || user.password !== body.password) {
      throw new BadRequestException('Неверное имя пользователя или пароль');
    }
    return { message: 'Login successful', userId: user.id };
  }
}
