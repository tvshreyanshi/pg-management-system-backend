import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import {
  Register,
  RegisterDocument,
} from 'src/modules/auth/register.model/register.schema';
import { LoginDto } from './login.dto';
import { OtpService } from 'src/services/otp.service';

@Injectable()
export class LoginService {
  constructor(
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Find user
    const user = await this.registerModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Update last login
    if ('lastLogin' in user) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT
    const token = this.jwtService.sign({
      id: user._id.toString(),
      email: user.email,
    });

    let otpSent = false;
    let otpMessage = '';
    let otp = null;

    // Send OTP only if account is not verified
    if (!user['isVerified']) {
      const otpResult = await this.otpService.generateAndSendOTP(
        user._id.toString(),
        'email',
        'login', // type of OTP
        user.email,
        user.username
      );

      otpSent = otpResult.success;
      otpMessage = otpResult.message;
      otp = otpResult.otp;

      if (!otpResult.success) {
        throw new BadRequestException(otpResult.message);
      }
    }

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        password: user.password,
        isVerified: user['isVerified'] || false,
      },
      token,
      otpSent,
      otpMessage,
      otp,
    };
  }
}
