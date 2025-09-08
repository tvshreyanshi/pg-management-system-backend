// src/property/dto/property-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PropertyResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyName: string;

  @ApiProperty()
  pgType: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  fullAddress: string;

  @ApiProperty()
  establishedYear: number;

  @ApiProperty()
  securityDeposit: number;

  @ApiProperty()
  contactPerson: string;

  @ApiProperty()
  contactNumber: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  totalRooms: number;

  @ApiProperty()
  totalBeds: number;

  @ApiProperty({ type: [String] })
  amenities: string[];

  @ApiProperty()
  status: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
