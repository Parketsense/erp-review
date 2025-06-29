import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { ManufacturersService } from './manufacturers.service';
import { CreateManufacturerDto } from '../types/attribute.types';

@Controller('manufacturers')
export class ManufacturersController {
  constructor(private readonly manufacturersService: ManufacturersService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.manufacturersService.findAll({
      includeInactive: includeInactive === 'true',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const manufacturer = await this.manufacturersService.findOne(id);
    
    return {
      success: true,
      data: manufacturer
    };
  }

  @Post()
  async create(@Body() createManufacturerDto: CreateManufacturerDto) {
    const manufacturer = await this.manufacturersService.create(createManufacturerDto);
    
    return {
      success: true,
      data: manufacturer,
      message: 'Manufacturer created successfully'
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateManufacturerDto: Partial<CreateManufacturerDto>
  ) {
    const manufacturer = await this.manufacturersService.update(id, updateManufacturerDto);
    
    return {
      success: true,
      data: manufacturer,
      message: 'Manufacturer updated successfully'
    };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const manufacturer = await this.manufacturersService.toggleActive(id);
    
    return {
      success: true,
      data: manufacturer,
      message: `Manufacturer ${manufacturer.isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const manufacturer = await this.manufacturersService.remove(id);
    
    return {
      success: true,
      data: manufacturer,
      message: 'Manufacturer deleted successfully'
    };
  }
} 