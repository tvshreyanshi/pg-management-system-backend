import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Register, RegisterSchema } from './register.schema';
import { RegisterService } from './register.service';
import { RegisterController } from './register.controller';
import { OtpService } from 'src/services/otp.service';
import { Otp, OtpSchema } from 'src/modules/auth/otp.schema';
import { EmailService } from 'src/services/email.service';

@Module({
  imports: [
    ConfigModule, // Add ConfigModule for environment variables
    MongooseModule.forFeature([
      { name: Register.name, schema: RegisterSchema },
      { name: Otp.name, schema: OtpSchema }, // Add OTP schema
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [
    RegisterService,
    OtpService, // Add OtpService
    EmailService, // Add EmailService
  ],
  controllers: [RegisterController],
  exports: [RegisterService, OtpService, EmailService], // Export OtpService if needed elsewhere
})
export class RegisterModule {}
