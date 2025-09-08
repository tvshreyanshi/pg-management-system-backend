// src/services/otp.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp, OtpDocument } from '../modules/auth/otp.schema';
import { EmailService } from '../services/email.service';
import {
  generateOTP,
  getOTPExpiry,
  isOTPExpired,
} from '../modules/auth/otp.utils';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private emailService: EmailService
  ) {}

  async generateAndSendOTP(
    userId: string,
    method: 'sms' | 'email',
    type: string = 'registration',
    contact: string,
    username?: string
  ): Promise<{
    otp: null;
    success: boolean;
    message: string;
  }> {
    try {
      // Delete any existing unused OTPs for this user and type
      await this.otpModel.deleteMany({
        userId: new Types.ObjectId(userId),
        type,
        isUsed: false,
      });

      // Generate new OTP
      const otp = generateOTP(6);
      const expiresAt = getOTPExpiry(5); // 5 minutes

      // Save OTP to database
      const otpRecord = new this.otpModel({
        userId: new Types.ObjectId(userId),
        otp,
        type,
        method,
        expiresAt,
      });

      await otpRecord.save();

      // Send OTP
      let sent = false;
      if (method === 'email') {
        sent = await this.emailService.sendOTP(
          contact,
          otp,
          username || 'User'
        );
      }

      if (!sent) {
        await this.otpModel.findByIdAndDelete(otpRecord._id);
        return { success: false, message: 'Failed to send OTP', otp: null };
      }

      return {
        success: true,
        message: `OTP sent successfully to your ${method}`,
        otp: null,
      };
    } catch (error) {
      console.error('OTP generation failed:', error);
      return { success: false, message: 'Failed to generate OTP', otp: null };
    }
  }

  async verifyOTP(
    userId: string,
    otp: string,
    type: string = 'registration'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const otpRecord = await this.otpModel
        .findOne({
          userId: new Types.ObjectId(userId),
          type,
          isUsed: false,
        })
        .sort({ createdAt: -1 });

      if (!otpRecord) {
        return { success: false, message: 'No valid OTP found' };
      }

      // Check if OTP is expired
      if (isOTPExpired(otpRecord.expiresAt)) {
        await this.otpModel.findByIdAndDelete(otpRecord._id);
        return { success: false, message: 'OTP has expired' };
      }

      // Increment attempts
      otpRecord.attempts += 1;

      // Check if too many attempts
      if (otpRecord.attempts > 3) {
        await this.otpModel.findByIdAndDelete(otpRecord._id);
        return {
          success: false,
          message: 'Too many failed attempts. Request a new OTP.',
        };
      }

      // Verify OTP
      if (otpRecord.otp !== otp) {
        await otpRecord.save();
        return { success: false, message: 'Invalid OTP' };
      }

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('OTP verification failed:', error);
      return { success: false, message: 'OTP verification failed' };
    }
  }
}
