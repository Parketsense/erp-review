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
import { AttributeValuesService } from './attribute-values.service';
import { CreateAttributeValueDto, UpdateAttributeValueDto, GetAttributeValuesQuery } from '../types/attribute.types';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly attributeValuesService: AttributeValuesService) {}

  @Get()
  async findByAttributeType(@Query() query: GetAttributeValuesQuery) {
    if (!query.attributeTypeId) {
      return {
        success: false,
        message: 'attributeTypeId is required'
      };
    }

    const attributeValues = await this.attributeValuesService.findByAttributeType(query);
    
    return {
      success: true,
      data: attributeValues,
      total: attributeValues.length
    };
  }

  @Get('by-manufacturer/:manufacturerId')
  async findByManufacturer(@Param('manufacturerId') manufacturerId: string) {
    const attributeValues = await this.attributeValuesService.findByManufacturer(manufacturerId);
    
    return {
      success: true,
      data: attributeValues,
      total: attributeValues.length
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const attributeValue = await this.attributeValuesService.findOne(id);
    
    return {
      success: true,
      data: attributeValue
    };
  }

  @Post()
  async create(@Body() createAttributeValueDto: CreateAttributeValueDto) {
    const attributeValue = await this.attributeValuesService.create(createAttributeValueDto);
    
    return {
      success: true,
      data: attributeValue,
      message: 'Attribute value created successfully'
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttributeValueDto: UpdateAttributeValueDto
  ) {
    const attributeValue = await this.attributeValuesService.update(id, updateAttributeValueDto);
    
    return {
      success: true,
      data: attributeValue,
      message: 'Attribute value updated successfully'
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const attributeValue = await this.attributeValuesService.remove(id);
    
    return {
      success: true,
      data: attributeValue,
      message: 'Attribute value deleted successfully'
    };
  }
} 