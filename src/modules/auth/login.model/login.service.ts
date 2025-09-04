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

@Injectable()
export class LoginService {
  constructor(
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const { email, password } = dto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.registerModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    // Optional: update last login if field exists
    if ('lastLogin' in user) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT
    const token = this.jwtService.sign({ id: user._id, email: user.email });

    return { user, token };
  }
}
