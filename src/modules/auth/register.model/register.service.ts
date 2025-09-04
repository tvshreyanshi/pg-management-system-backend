import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Register, RegisterDocument } from './register.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>
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
    return user.save();
  }
}
