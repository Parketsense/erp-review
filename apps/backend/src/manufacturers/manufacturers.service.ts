import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Manufacturer, CreateManufacturerDto } from '../types/attribute.types';

@Injectable()
export class ManufacturersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Manufacturer[]> {
    return this.prisma.manufacturer.findMany({
      where: { isActive: true },
      orderBy: { displayName: 'asc' },
      include: {
        _count: {
          select: { 
            products: true,
            attributeValues: true 
          }
        }
      }
    }) as any;
  }

  async findOne(id: string): Promise<Manufacturer> {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            code: true,
            nameBg: true,
            nameEn: true,
            isActive: true
          }
        },
        attributeValues: {
          where: { isActive: true },
          include: {
            attributeType: {
              select: {
                nameBg: true,
                nameEn: true,
                type: true
              }
            }
          }
        }
      }
    });

    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }

    return manufacturer as any;
  }

  async create(data: CreateManufacturerDto): Promise<Manufacturer> {
    return this.prisma.manufacturer.create({
      data
    }) as any;
  }

  async update(id: string, data: Partial<CreateManufacturerDto>): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    
    return this.prisma.manufacturer.update({
      where: { id: manufacturer.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    }) as any;
  }

  async remove(id: string): Promise<Manufacturer> {
    const manufacturer = await this.findOne(id);
    
    return this.prisma.manufacturer.update({
      where: { id: manufacturer.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    }) as any;
  }

  async toggleActive(id: string): Promise<Manufacturer> {
    const manufacturer = await this.prisma.manufacturer.findUnique({
      where: { id }
    });
    
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer with ID ${id} not found`);
    }
    
    return this.prisma.manufacturer.update({
      where: { id },
      data: {
        isActive: !manufacturer.isActive,
        updatedAt: new Date()
      }
    }) as any;
  }
} 