// register.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegisterDocument = Register & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Register {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  lastLogin?: Date;

  @Prop({ type: String, default: null })
  otp?: string;

  @Prop({ type: Date, default: null })
  otpExpiry?: Date;

  @Prop({ type: Boolean, default: false })
  isVerified?: boolean; // 👈 add this, since you're using it in login
}

export const RegisterSchema = SchemaFactory.createForClass(Register);
