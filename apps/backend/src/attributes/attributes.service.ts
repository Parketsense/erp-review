import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async create(createAttributeDto: CreateAttributeDto) {
    console.log('CreateAttributeDto:', JSON.stringify(createAttributeDto, null, 2));
    const { productTypeIds, ...attributeData } = createAttributeDto;
    
    // Create attribute types for each product type
    const createdAttributes = [];
    
    for (const productTypeId of productTypeIds) {
      // Извличаме само позволените полета за Prisma
      const {
        name, nameBg, nameEn, type, isRequired, displayOrder,
        dependencyType, dependencyValue, icon, description
      } = attributeData;

      try {
        const attribute = await this.prisma.attributeType.create({
          data: {
            name,
            nameBg,
            nameEn,
            type,
            isRequired,
            displayOrder,
            dependencyType,
            dependencyValue,
            icon,
            description,
            productTypeId,
          },
          include: {
            productType: true,
          },
        });
        createdAttributes.push(attribute);
      } catch (error) {
        if (error.code === 'P2002') {
          // Get product type name for better error message
          const productType = await this.prisma.productType.findUnique({
            where: { id: productTypeId },
            select: { nameBg: true, nameEn: true }
          });
          
          const productTypeName = productType?.nameBg || productType?.nameEn || productTypeId;
          throw new ConflictException(
            `Атрибут с име "${name}" вече съществува за продукт тип "${productTypeName}". Моля, изберете друго име.`
          );
        }
        throw error;
      }
    }
    
    return createdAttributes;
  }

  async findAll(query: any) {
    const { productTypeId, ...otherQuery } = query;
    
    const where: any = {};
    if (productTypeId) {
      where.productTypeId = productTypeId;
    }
    
    return this.prisma.attributeType.findMany({
      where,
      include: {
        productType: true,
        attributeValues: {
          include: {
            manufacturer: true,
          },
        },
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.attributeType.findUnique({
      where: { id },
      include: {
        productType: true,
        attributeValues: {
          include: {
            manufacturer: true,
          },
        },
      },
    });
  }

  async update(id: string, updateAttributeDto: UpdateAttributeDto) {
    const { productTypeIds, ...attributeData } = updateAttributeDto;
    
    return this.prisma.attributeType.update({
      where: { id },
      data: attributeData,
      include: {
        productType: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.attributeType.delete({
      where: { id },
    });
  }
} 