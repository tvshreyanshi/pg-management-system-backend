// src/schemas/otp.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ type: Types.ObjectId, ref: 'Register', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  type: string; // 'registration', 'login', 'password_reset'

  @Prop({ required: true })
  method: string; // 'sms' or 'email'

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: 0 })
  attempts: number; // Track verification attempts
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index for automatic deletion of expired OTPs
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
