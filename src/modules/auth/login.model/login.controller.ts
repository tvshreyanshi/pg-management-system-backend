import { Controller, Post, Body } from '@nestjs/common';
import { LoginService } from './login.service';
import * as loginDto_1 from './login.dto';
import { EmailService } from 'src/services/email.service';
import { OtpService } from 'src/services/otp.service';

@Controller('auth')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly emailService: EmailService,
    private readonly otpService: OtpService
  ) {}

  @Post('login')
  async login(@Body() loginDto: loginDto_1.LoginDto) {
    const result = await this.loginService.login(loginDto);

    return {
      message: 'Login successful',
      result,
    };
  }
}
