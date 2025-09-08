import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Register, RegisterDocument } from './register.schema';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from 'src/services/otp.service';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>,
    private jwtService: JwtService, // Inject JwtService
    private otpService: OtpService
  ) {}

  async create(username: string, email: string, password: string) {
    const existingUser = await this.registerModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.registerModel({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = (await user.save()) as RegisterDocument;

    // Generate JWT token
    const payload = {
      sub: savedUser._id, // 'sub' is standard JWT claim for subject (user ID)
      email: savedUser.email,
      username: savedUser.username,
    };

    const authToken = await this.jwtService.signAsync(payload);

    // Define the OTP method (e.g., 'email' or 'sms')
    const otpMethod = 'email'; // or set dynamically based on your logic

    // Generate and send OTP
    // const contact = otpMethod === 'sms' ? phoneNumber : email;
    const otpResult = await this.otpService.generateAndSendOTP(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      (savedUser._id as any).toString(),
      otpMethod,
      'registration',
      email,
      username
    );

    // Return user without password and with JWT token
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment
    const { password: _, ...userWithoutPassword } = savedUser.toObject();

    return {
      authToken,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user: userWithoutPassword,
      otp: {
        sent: otpResult.success,
        message: otpResult.message,
        method: otpMethod,
        expiresIn: '5 minutes',
      },
    };
  }
}
