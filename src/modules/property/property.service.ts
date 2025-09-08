// src/modules/property/property.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Property, PropertyDocument } from '../property/property.schema';
import { CreatePropertyDto } from '../property/create-property.dto';
import { UpdatePropertyDto } from '../property/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectModel(Property.name) private propertyModel: Model<PropertyDocument>,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    userId: string
  ): Promise<Property> {
    const newProperty = new this.propertyModel({
      ...createPropertyDto,
      ownerId: new Types.ObjectId(userId),
    });

    return await newProperty.save();
  }

  async findAll(page: number = 1, limit: number = 10, filters?: any): Promise<{
    data: Property[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query: any = {};

    // Apply filters
    if (filters?.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters?.pgType) {
      query.pgType = filters.pgType;
    }

    if (filters?.minDeposit || filters?.maxDeposit) {
      query.securityDeposit = {};
      if (filters.minDeposit) query.securityDeposit.$gte = filters.minDeposit;
      if (filters.maxDeposit) query.securityDeposit.$lte = filters.maxDeposit;
    }

    if (filters?.amenities && filters.amenities.length > 0) {
      query.amenities = { $all: filters.amenities };
    }

    if (filters?.minRooms || filters?.maxRooms) {
      query.totalRooms = {};
      if (filters.minRooms) query.totalRooms.$gte = filters.minRooms;
      if (filters.maxRooms) query.totalRooms.$lte = filters.maxRooms;
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const total = await this.propertyModel.countDocuments(query);
    const data = await this.propertyModel
      .find(query)
      .populate('ownerId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, page: number = 1, limit: number = 10): Promise<{
    data: Property[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = { ownerId: new Types.ObjectId(userId) };
    
    const total = await this.propertyModel.countDocuments(query);
    const data = await this.propertyModel
      .find(query)
      .populate('ownerId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Property> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid property ID: ${id}`);
    }

    const property = await this.propertyModel
      .findById(id)
      .populate('ownerId', 'username email')
      .exec();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string
  ): Promise<Property> {
    const property = await this.findOne(id);

    if (property.ownerId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own properties');
    }

    const updatedProperty = await this.propertyModel
      .findByIdAndUpdate(id, updatePropertyDto, { new: true })
      .populate('ownerId', 'username email')
      .exec();

    if (!updatedProperty) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return updatedProperty;
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const property = await this.findOne(id);

    if (property.ownerId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own properties');
    }

    await this.propertyModel.findByIdAndDelete(id).exec();
    return { message: 'Property deleted successfully' };
  }

  async findByAmenities(amenities: string[], page: number = 1, limit: number = 10): Promise<{
    data: Property[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = { amenities: { $all: amenities } };
    
    const total = await this.propertyModel.countDocuments(query);
    const data = await this.propertyModel
      .find(query)
      .populate('ownerId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
