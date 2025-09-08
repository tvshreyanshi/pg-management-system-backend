// src/modules/property/schemas/property.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  propertyName: string;

  @Prop({ required: true, enum: ['Boys', 'Girls', 'Co-ed'] })
  pgType: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  fullAddress: string;

  @Prop({ required: true, min: 1900, max: new Date().getFullYear() })
  establishedYear: number;

  @Prop({ required: true, min: 0 })
  securityDeposit: number;

  @Prop({ required: true })
  contactPerson: string;

  @Prop({ required: true })
  contactNumber: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, min: 1 })
  totalRooms: number;

  @Prop({ required: true, min: 1 })
  totalBeds: number;

  @Prop({ type: [String], required: true })
  amenities: string[];

  @Prop({ default: 'active', enum: ['active', 'inactive', 'maintenance'] })
  status: string;

  @Prop({ type: Types.ObjectId, required: true, ref: 'Register' })
  ownerId: Types.ObjectId;
}

export const PropertySchema = SchemaFactory.createForClass(Property);
