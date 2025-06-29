import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from '../types/attribute.types';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll() {
    const suppliers = await this.suppliersService.findAll();
    
    return {
      success: true,
      data: suppliers,
      total: suppliers.length
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const supplier = await this.suppliersService.findOne(id);
    
    return {
      success: true,
      data: supplier
    };
  }

  @Post()
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    const supplier = await this.suppliersService.create(createSupplierDto);
    
    return {
      success: true,
      data: supplier,
      message: 'Supplier created successfully'
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: Partial<CreateSupplierDto>
  ) {
    const supplier = await this.suppliersService.update(id, updateSupplierDto);
    
    return {
      success: true,
      data: supplier,
      message: 'Supplier updated successfully'
    };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const supplier = await this.suppliersService.toggleActive(id);
    
    return {
      success: true,
      data: supplier,
      message: `Supplier ${supplier.isActive ? 'activated' : 'deactivated'} successfully`
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const supplier = await this.suppliersService.remove(id);
    
    return {
      success: true,
      data: supplier,
      message: 'Supplier deleted successfully'
    };
  }
} 