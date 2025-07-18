import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Supplier, CreateSupplierDto } from '../types/attribute.types';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: { includeInactive?: boolean } = {}): Promise<{ data: Supplier[] }> {
    const where: any = {};
    
    // Include inactive suppliers only if explicitly requested
    if (!options.includeInactive) {
      where.isActive = true;
    }

    const suppliers = await this.prisma.supplier.findMany({
      where,
      orderBy: { displayName: 'asc' }
    }) as any;

    return { data: suppliers };
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id }
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }

    return supplier as any;
  }

  async create(data: CreateSupplierDto): Promise<Supplier> {
    return this.prisma.supplier.create({
      data
    }) as any;
  }

  async update(id: string, data: Partial<CreateSupplierDto>): Promise<Supplier> {
    const supplier = await this.findOne(id);
    
    return this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    }) as any;
  }

  async remove(id: string): Promise<Supplier> {
    const supplier = await this.findOne(id);
    
    return this.prisma.supplier.update({
      where: { id: supplier.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    }) as any;
  }

  async toggleActive(id: string): Promise<Supplier> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id }
    });
    
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    
    return this.prisma.supplier.update({
      where: { id },
      data: {
        isActive: !supplier.isActive,
        updatedAt: new Date()
      }
    }) as any;
  }
} 