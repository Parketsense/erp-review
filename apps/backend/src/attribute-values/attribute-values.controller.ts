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

  @Get('by-product-type-manufacturer')
  async findByProductTypeAndManufacturer(
    @Query('productTypeId') productTypeId: string,
    @Query('manufacturerId') manufacturerId: string
  ) {
    if (!productTypeId || !manufacturerId) {
      return {
        success: false,
        message: 'Both productTypeId and manufacturerId are required'
      };
    }

    const attributeValues = await this.attributeValuesService.findByProductTypeAndManufacturer(productTypeId, manufacturerId);
    
    // Group by attribute type for easier frontend consumption
    const groupedByAttribute = attributeValues.reduce((acc, value) => {
      if (value.attributeType) {
        const attrId = value.attributeType.id;
        if (!acc[attrId]) {
          acc[attrId] = {
            attributeType: value.attributeType,
            values: []
          };
        }
        acc[attrId].values.push(value);
      }
      return acc;
    }, {} as any);

    const attributesCount = Object.keys(groupedByAttribute).length;
    
    console.log(`🔍 Loading attribute values for: { productTypeId: '${productTypeId}', manufacturerId: '${manufacturerId}' }`);
    console.log(`📋 Found ${attributesCount} attributes for product type`);
    
    // Log each attribute and its values
    Object.values(groupedByAttribute).forEach((group: any) => {
      console.log(`📦 Found ${group.values.length} values for attribute ${group.attributeType.nameBg}`);
    });
    
    console.log(`✅ Total attribute values loaded: ${attributeValues.length}`);
    
    return {
      success: true,
      data: attributeValues,
      total: attributeValues.length,
      attributesCount
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