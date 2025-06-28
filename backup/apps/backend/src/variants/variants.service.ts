import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  async create(createVariantDto: CreateVariantDto) {
    // Get the next order number if not provided
    if (!createVariantDto.order) {
      const maxOrder = await this.prisma.projectVariant.findFirst({
        where: { phaseId: createVariantDto.phaseId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      createVariantDto.order = (maxOrder?.sortOrder || 0) + 1;
    }

    return this.prisma.projectVariant.create({
      data: {
        name: createVariantDto.name,
        phaseId: createVariantDto.phaseId,
        sortOrder: createVariantDto.order,
        status: createVariantDto.status || 'ACTIVE'
      },
      include: {
        phase: {
          include: {
            project: true
          }
        },
        rooms: {
          include: {
            products: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.projectVariant.findMany({
      include: {
        phase: {
          include: {
            project: {
              include: {
                client: true
              }
            }
          }
        },
        rooms: {
          include: {
            products: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const variant = await this.prisma.projectVariant.findUnique({
      where: { id },
      include: {
        phase: {
          include: {
            project: {
              include: {
                client: true
              }
            }
          }
        },
        rooms: {
          include: {
            products: true
          }
        }
      }
    });

    if (!variant) {
      throw new NotFoundException(`Variant with ID ${id} not found`);
    }

    return variant;
  }

  async update(id: string, updateVariantDto: UpdateVariantDto) {
    // Check if variant exists
    await this.findOne(id);

    const updateData: any = {};
    if (updateVariantDto.name) updateData.name = updateVariantDto.name;
    if (updateVariantDto.status) updateData.status = updateVariantDto.status;
    if (updateVariantDto.order) updateData.sortOrder = updateVariantDto.order;

    return this.prisma.projectVariant.update({
      where: { id },
      data: updateData,
      include: {
        phase: true,
        rooms: true
      }
    });
  }

  async remove(id: string) {
    // Check if variant exists
    await this.findOne(id);

    return this.prisma.projectVariant.delete({
      where: { id }
    });
  }

  async findByPhase(phaseId: string) {
    return this.prisma.projectVariant.findMany({
      where: { phaseId },
      include: {
        phase: true,
        rooms: {
          include: {
            products: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
  }

  async reorder(variantId: string, newOrder: number) {
    const variant = await this.findOne(variantId);
    
    // Get all variants in the same phase
    const variants = await this.findByPhase(variant.phaseId);
    
    // Update orders
    const updates = variants.map((v: any, index: number) => {
      let order = index + 1;
      if (v.id === variantId) {
        order = newOrder;
      } else if (index >= newOrder - 1) {
        order = index + 2;
      }
      
      return this.prisma.projectVariant.update({
        where: { id: v.id },
        data: { sortOrder: order }
      });
    });

    await this.prisma.$transaction(updates);
    
    return this.findByPhase(variant.phaseId);
  }
} 