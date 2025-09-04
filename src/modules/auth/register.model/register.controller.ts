import { Controller, Post, Body } from '@nestjs/common';
import { RegisterService } from './register.service';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string
  ) {
    const user = await this.registerService.create(username, email, password);
    return { message: 'User registered successfully', user };
  }
}
