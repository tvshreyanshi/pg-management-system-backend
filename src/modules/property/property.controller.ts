// src/property/property.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PropertyService } from './property.service';
import { CreatePropertyDto } from '../property/create-property.dto';
import { UpdatePropertyDto } from '../property/update-property.dto';
import { PropertyResponseDto } from '../property/property-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('PG Properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new PG property' })
  @ApiResponse({
    status: 201,
    description: 'PG Property created successfully',
    type: PropertyResponseDto,
  })
  async create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return await this.propertyService.create(createPropertyDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all PG properties with pagination and filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'location',
    required: false,
    type: String,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'pgType',
    required: false,
    enum: ['Boys', 'Girls', 'Co-ed'],
    description: 'Filter by PG type',
  })
  @ApiQuery({ name: 'minDeposit', required: false, type: Number, description: 'Minimum security deposit' })
  @ApiQuery({ name: 'maxDeposit', required: false, type: Number, description: 'Maximum security deposit' })
  @ApiQuery({ name: 'amenities', required: false, type: [String], description: 'Filter by amenities (comma-separated)' })
  @ApiQuery({ name: 'minRooms', required: false, type: Number, description: 'Minimum total rooms' })
  @ApiQuery({ name: 'maxRooms', required: false, type: Number, description: 'Maximum total rooms' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'maintenance'], description: 'Property status' })
  @ApiResponse({ status: 200, description: 'PG Properties retrieved successfully' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('location') location?: string,
    @Query('pgType') pgType?: string,
    @Query('minDeposit') minDeposit?: number,
    @Query('maxDeposit') maxDeposit?: number,
    @Query('amenities') amenities?: string,
    @Query('minRooms') minRooms?: number,
    @Query('maxRooms') maxRooms?: number,
    @Query('status') status?: string,
  ) {
    const filters = {
      location,
      pgType,
      minDeposit,
      maxDeposit,
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : undefined,
      minRooms,
      maxRooms,
      status,
    };
    return await this.propertyService.findAll(page, limit, filters);
  }

  @Get('my-properties')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user PG properties' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User PG properties retrieved successfully' })
  async findMyProperties(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return await this.propertyService.findByUser(req.user.id, page, limit);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get PG properties by specific user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User PG properties retrieved successfully' })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.propertyService.findByUser(userId, page, limit);
  }

  @Get('search/amenities')
  @ApiOperation({ summary: 'Search PG properties by amenities' })
  @ApiQuery({ name: 'amenities', required: true, type: String, description: 'Comma-separated amenities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Properties with specified amenities retrieved successfully' })
  async findByAmenities(
    @Query('amenities') amenities: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const amenitiesArray = amenities.split(',').map(a => a.trim());
    return await this.propertyService.findByAmenities(amenitiesArray, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PG property by ID' })
  @ApiResponse({ status: 200, description: 'PG Property retrieved successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'PG Property not found' })
  async findOne(@Param('id') id: string) {
    return await this.propertyService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update PG property' })
  @ApiResponse({ status: 200, description: 'PG Property updated successfully', type: PropertyResponseDto })
  @ApiResponse({ status: 404, description: 'PG Property not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not property owner' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ) {
    return await this.propertyService.update(id, updatePropertyDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete PG property' })
  @ApiResponse({ status: 200, description: 'PG Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'PG Property not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not property owner' })
  async remove(@Param('id') id: string, @Request() req) {
    return await this.propertyService.remove(id, req.user.id);
  }
}
