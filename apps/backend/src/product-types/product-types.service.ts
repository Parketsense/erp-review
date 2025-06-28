import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductType, CreateProductTypeDto } from '../types/attribute.types';

@Injectable()
export class ProductTypesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<ProductType[]> {
    return this.prisma.productType.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { nameBg: 'asc' }
      ],
      include: {
        attributeTypes: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            attributeValues: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                manufacturer: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    colorCode: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    }) as any;
  }

  async findOne(id: string): Promise<ProductType> {
    const productType = await this.prisma.productType.findUnique({
      where: { id },
      include: {
        attributeTypes: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          include: {
            attributeValues: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' }
            }
          }
        }
      }
    });

    if (!productType) {
      throw new NotFoundException(`Product type with ID ${id} not found`);
    }

    return productType as any;
  }

  async findAttributesByProductType(id: string) {
    const productType = await this.findOne(id);
    
    return {
      productType: {
        id: productType.id,
        name: productType.name,
        nameBg: productType.nameBg,
        nameEn: productType.nameEn
      },
      attributes: productType.attributeTypes?.map(attr => ({
        id: attr.id,
        name: attr.name,
        nameBg: attr.nameBg,
        nameEn: attr.nameEn,
        type: attr.type,
        isRequired: attr.isRequired,
        displayOrder: attr.displayOrder,
        placeholder: attr.placeholder,
        values: attr.attributeValues?.map(value => ({
          id: value.id,
          nameBg: value.nameBg,
          nameEn: value.nameEn,
          icon: value.icon,
          colorCode: value.colorCode,
          manufacturerId: value.manufacturerId,
          sortOrder: value.sortOrder,
          isDefault: value.isDefault
        })) || []
      })) || []
    };
  }

  async create(data: CreateProductTypeDto): Promise<ProductType> {
    return this.prisma.productType.create({
      data
    }) as any;
  }

  async update(id: string, data: Partial<CreateProductTypeDto>): Promise<ProductType> {
    const productType = await this.findOne(id);
    
    return this.prisma.productType.update({
      where: { id: productType.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    }) as any;
  }

  async remove(id: string): Promise<ProductType> {
    const productType = await this.findOne(id);
    
    return this.prisma.productType.update({
      where: { id: productType.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    }) as any;
  }
} 