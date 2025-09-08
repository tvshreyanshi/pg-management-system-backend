import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpService } from 'src/services/otp.service';
import { Otp, OtpSchema } from './otp.schema';
import { EmailService } from 'src/services/email.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }])],
  providers: [OtpService, EmailService],
  exports: [OtpService], // 👈 make OtpService available outside
})
export class OtpModule {}
