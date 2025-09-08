// src/modules/property/property.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { Property, PropertySchema } from '../property/property.schema';
import {
  Register,
  RegisterSchema,
} from '../auth/register.model/register.schema';
// import { User, UserSchema } from '../../schemas/user.schema';
// import { jwtConstants } from '../../auth/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Property.name, schema: PropertySchema },
      { name: Register.name, schema: RegisterSchema },
      { name: Register.name, schema: RegisterSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
