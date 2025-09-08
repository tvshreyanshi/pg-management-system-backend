import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import {
  Register,
  RegisterSchema,
} from '../../auth/register.model/register.schema';
import { EmailService } from 'src/services/email.service';
// import { Otp } from '../otp.schema';
import { OtpModule } from '../../auth/otp.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Register.name, schema: RegisterSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
    OtpModule,
  ],
  providers: [LoginService, EmailService],
  controllers: [LoginController],
})
export class LoginModule {}
