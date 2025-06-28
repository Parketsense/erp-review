import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { CreateProductTypeDto } from '../types/attribute.types';

@Controller('product-types')
export class ProductTypesController {
  constructor(private readonly productTypesService: ProductTypesService) {}

  @Get()
  async findAll() {
    const productTypes = await this.productTypesService.findAll();
    
    return {
      success: true,
      data: productTypes,
      total: productTypes.length
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const productType = await this.productTypesService.findOne(id);
    
    return {
      success: true,
      data: productType
    };
  }

  @Get(':id/attributes')
  async findAttributesByProductType(@Param('id') id: string) {
    const result = await this.productTypesService.findAttributesByProductType(id);
    
    return {
      success: true,
      data: result
    };
  }

  @Post()
  async create(@Body() createProductTypeDto: CreateProductTypeDto) {
    const productType = await this.productTypesService.create(createProductTypeDto);
    
    return {
      success: true,
      data: productType,
      message: 'Product type created successfully'
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductTypeDto: Partial<CreateProductTypeDto>
  ) {
    const productType = await this.productTypesService.update(id, updateProductTypeDto);
    
    return {
      success: true,
      data: productType,
      message: 'Product type updated successfully'
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const productType = await this.productTypesService.remove(id);
    
    return {
      success: true,
      data: productType,
      message: 'Product type deleted successfully'
    };
  }
} 