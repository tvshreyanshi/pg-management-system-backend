// src/auth/guards/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Register, RegisterDocument } from '../register.model/register.schema';
// import { User, UserDocument } from '../../schemas/user.schema';
// import { jwtConstants } from '../constants';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  userModel: any;
  constructor(
    private jwtService: JwtService,
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>
    // @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      });
      // Verify user still exists
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let user = await this.registerModel.findById(payload.sub).exec();
      if (!user) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        user = await this.userModel.findById(payload.sub).exec();
      }
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      // Assign the user info to the request object
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      request['user'] = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        id: payload.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        email: payload.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        username: payload.username,
      }; // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
