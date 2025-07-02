import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  async create(createVariantDto: CreateVariantDto) {
    const { phaseId, variantOrder, ...data } = createVariantDto;

    // Get the phase to validate it exists
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    // Determine the order if not provided
    let order = variantOrder;
    if (!order) {
      const lastVariant = await this.prisma.phaseVariant.findFirst({
        where: { phaseId },
        orderBy: { variantOrder: 'desc' },
      });
      order = (lastVariant?.variantOrder || 0) + 1;
    }

    // Create the variant
    const variant = await this.prisma.phaseVariant.create({
      data: {
        phaseId,
        variantOrder: order,
        ...data,
      },
      include: {
        phase: {
          include: {
            project: true,
          },
        },
        rooms: {
          include: {
            products: {
              include: {
                product: true,
              },
            },
            _count: {
              select: {
                products: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    return {
      success: true,
      data: variant,
      message: 'Variant created successfully'
    };
  }

  async findAll() {
    const variants = await this.prisma.phaseVariant.findMany({
      include: {
        phase: {
          include: {
            project: true,
          },
        },
        rooms: {
          include: {
            _count: {
              select: {
                products: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: [
        { phase: { project: { name: 'asc' } } },
        { phase: { phaseOrder: 'asc' } },
        { variantOrder: 'asc' },
      ],
    });

    return {
      success: true,
      data: variants,
      message: 'Variants retrieved successfully'
    };
  }

  async findByPhase(phaseId: string) {
    const variants = await this.prisma.phaseVariant.findMany({
      where: { phaseId },
      include: {
        phase: {
          include: {
            project: true,
          },
        },
        rooms: {
          include: {
            products: {
              include: {
                product: true,
              },
            },
            _count: {
              select: {
                products: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: { variantOrder: 'asc' },
    });

    return {
      success: true,
      data: variants,
      message: 'Phase variants retrieved successfully'
    };
  }

  async findOne(id: string) {
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id },
      include: {
        phase: {
          include: {
            project: true,
          },
        },
        rooms: {
          include: {
            products: {
              include: {
                product: {
                  include: {
                    manufacturer: true,
                    productType: true,
                  },
                },
              },
            },
            images: true,
            _count: {
              select: {
                products: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return {
      success: true,
      data: variant,
      message: 'Variant retrieved successfully'
    };
  }

  async update(id: string, updateVariantDto: UpdateVariantDto) {
    const existingVariant = await this.prisma.phaseVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new NotFoundException('Variant not found');
    }

    const variant = await this.prisma.phaseVariant.update({
      where: { id },
      data: updateVariantDto,
      include: {
        phase: {
          include: {
            project: true,
          },
        },
        rooms: {
          include: {
            products: {
              include: {
                product: true,
              },
            },
            _count: {
              select: {
                products: true,
                images: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    return {
      success: true,
      data: variant,
      message: 'Variant updated successfully'
    };
  }

  async remove(id: string) {
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Check if variant has rooms with products
    if (variant._count.rooms > 0) {
      const roomsWithProducts = await this.prisma.variantRoom.findMany({
        where: { variantId: id },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      const hasProducts = roomsWithProducts.some(room => room._count.products > 0);
      if (hasProducts) {
        throw new BadRequestException('Cannot delete variant with rooms that contain products');
      }
    }

    await this.prisma.phaseVariant.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: 'Variant deleted successfully'
    };
  }

  async reorderVariants(phaseId: string, variantIds: string[]) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        variants: true,
      },
    });

    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    // Validate all variant IDs belong to this phase
    const validVariantIds = phase.variants.map(v => v.id);
    const invalidIds = variantIds.filter(id => !validVariantIds.includes(id));
    
    if (invalidIds.length > 0) {
      throw new BadRequestException('Some variant IDs do not belong to this phase');
    }

    // Use transaction to avoid conflicts
    return await this.prisma.$transaction(async (tx) => {
      // First, set all variants to temporary negative orders
      await tx.phaseVariant.updateMany({
        where: { phaseId },
        data: { variantOrder: -1 },
      });

      // Then update each variant with its new order
      for (let i = 0; i < variantIds.length; i++) {
        await tx.phaseVariant.update({
          where: { id: variantIds[i] },
          data: { variantOrder: i + 1 },
        });
      }

      // Get updated variants
      const updatedVariants = await tx.phaseVariant.findMany({
        where: { phaseId },
        include: {
          phase: {
            include: {
              project: true,
            },
          },
          rooms: {
            include: {
              _count: {
                select: {
                  products: true,
                  images: true,
                },
              },
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
        orderBy: { variantOrder: 'asc' },
      });

      return {
        success: true,
        data: updatedVariants,
        message: 'Variants reordered successfully'
      };
    });
  }

  async getStats() {
    const [totalVariants, variantsByPhase, variantsByIncludeInOffer] = await Promise.all([
      this.prisma.phaseVariant.count(),
      this.prisma.phaseVariant.groupBy({
        by: ['phaseId'],
        _count: true,
      }),
      this.prisma.phaseVariant.groupBy({
        by: ['includeInOffer'],
        _count: true,
      }),
    ]);

    const includedInOffer = variantsByIncludeInOffer.find(g => g.includeInOffer)?._count || 0;
    const excludedFromOffer = variantsByIncludeInOffer.find(g => !g.includeInOffer)?._count || 0;

    return {
      success: true,
      data: {
        total: totalVariants,
        includedInOffer,
        excludedFromOffer,
        phaseCount: variantsByPhase.length,
      },
      message: 'Variant stats retrieved successfully'
    };
  }
} 