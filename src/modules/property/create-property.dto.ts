// src/property/dto/create-property.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsEmail,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Sunshine PG' })
  @IsNotEmpty()
  @IsString()
  propertyName: string;

  @ApiProperty({ enum: ['Boys', 'Girls', 'Co-ed'], example: 'Boys' })
  @IsNotEmpty()
  @IsEnum(['Boys', 'Girls', 'Co-ed'])
  pgType: string;

  @ApiProperty({ example: 'Koramangala, Bangalore' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    example: '123, 4th Cross, Koramangala 4th Block, Bangalore - 560034',
  })
  @IsNotEmpty()
  @IsString()
  fullAddress: string;

  @ApiProperty({ example: 2015 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  establishedYear: number;

  @ApiProperty({
    example: 25000,
    description: 'Security deposit amount in INR',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  securityDeposit: number;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  contactPerson: string;

  @ApiProperty({ example: '+91 9876543210' })
  @IsNotEmpty()
  @IsString()
  contactNumber: string;

  @ApiProperty({ example: 'contact@sunshinepg.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 25 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalRooms: number;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  totalBeds: number;

  @ApiProperty({
    type: [String],
    example: [
      'WiFi',
      'AC',
      'Laundry',
      'Mess',
      'Parking',
      'Security',
      'Power Backup',
      'Water Cooler',
    ],
    description: 'List of amenities available',
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @ApiProperty({
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: string;
}
