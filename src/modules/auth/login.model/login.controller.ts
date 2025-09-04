import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';
import * as loginDto_1 from './login.dto';

@Controller('auth')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  async login(@Body() loginDto: loginDto_1.LoginDto) {
    const result = await this.loginService.login(loginDto);
    return {
      message: 'Login successful',
      token: result.token,
      user: result.user,
    };
  }
}
