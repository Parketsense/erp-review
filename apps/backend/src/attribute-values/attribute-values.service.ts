import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttributeValue, CreateAttributeValueDto, UpdateAttributeValueDto, GetAttributeValuesQuery } from '../types/attribute.types';

@Injectable()
export class AttributeValuesService {
  constructor(private prisma: PrismaService) {}

  async findByAttributeType(query: GetAttributeValuesQuery): Promise<AttributeValue[]> {
    const where: any = {
      attributeTypeId: query.attributeTypeId,
      isActive: query.isActive !== undefined ? query.isActive : true
    };

    // Filter by manufacturer if specified
    if (query.manufacturerId) {
      where.OR = [
        { manufacturerId: query.manufacturerId },
        { manufacturerId: null } // Include values available for all manufacturers
      ];
    }

    return this.prisma.attributeValue.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { nameBg: 'asc' }
      ],
      include: {
        attributeType: {
          select: {
            nameBg: true,
            nameEn: true,
            type: true
          }
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true
          }
        },
        _count: {
          select: {
            productAttributeValues: true
          }
        }
      }
    }) as any;
  }

  async findOne(id: string): Promise<AttributeValue> {
    const attributeValue = await this.prisma.attributeValue.findUnique({
      where: { id },
      include: {
        attributeType: {
          include: {
            productType: {
              select: {
                nameBg: true,
                nameEn: true
              }
            }
          }
        },
        manufacturer: true,
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!attributeValue) {
      throw new NotFoundException(`Attribute value with ID ${id} not found`);
    }

    return attributeValue as any;
  }

  async create(data: CreateAttributeValueDto, userId?: string): Promise<AttributeValue> {
    return this.prisma.attributeValue.create({
      data: {
        ...data,
        createdById: userId,
        updatedById: userId
      },
      include: {
        attributeType: {
          select: {
            nameBg: true,
            nameEn: true,
            type: true
          }
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true
          }
        }
      }
    }) as any;
  }

  async update(id: string, data: UpdateAttributeValueDto, userId?: string): Promise<AttributeValue> {
    const attributeValue = await this.findOne(id);
    
    return this.prisma.attributeValue.update({
      where: { id: attributeValue.id },
      data: {
        ...data,
        updatedById: userId,
        updatedAt: new Date()
      },
      include: {
        attributeType: {
          select: {
            nameBg: true,
            nameEn: true,
            type: true
          }
        },
        manufacturer: {
          select: {
            displayName: true,
            colorCode: true
          }
        }
      }
    }) as any;
  }

  async remove(id: string, userId?: string): Promise<AttributeValue> {
    const attributeValue = await this.findOne(id);
    
    return this.prisma.attributeValue.update({
      where: { id: attributeValue.id },
      data: {
        isActive: false,
        updatedById: userId,
        updatedAt: new Date()
      }
    }) as any;
  }

  async findByManufacturer(manufacturerId: string): Promise<AttributeValue[]> {
    return this.prisma.attributeValue.findMany({
      where: {
        OR: [
          { manufacturerId },
          { manufacturerId: null } // Include values available for all manufacturers
        ],
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { nameBg: 'asc' }
      ],
      include: {
        attributeType: {
          select: {
            nameBg: true,
            nameEn: true,
            type: true,
            productTypeId: true
          }
        }
      }
    }) as any;
  }
} 