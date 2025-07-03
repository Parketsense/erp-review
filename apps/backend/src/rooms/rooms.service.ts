import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(variantId: string, createRoomDto: CreateRoomDto) {
    // Verify that variant exists and get phase discount info
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id: variantId },
      include: {
        phase: {
          select: {
            id: true,
            discountEnabled: true,
            phaseDiscount: true,
          },
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Calculate room discount based on variant and phase settings
    let roomDiscount = createRoomDto.discount ?? 0;
    let roomDiscountEnabled = createRoomDto.discountEnabled ?? true;
    
    // Override discount based on variant settings
    if (!variant.discountEnabled || !variant.phase.discountEnabled) {
      // If variant or phase discount is disabled, set room discount to 0
      roomDiscount = 0;
      roomDiscountEnabled = false;
    } else if (createRoomDto.discount === undefined) {
      // If no specific discount provided and discounts are enabled, use phase discount
      roomDiscount = variant.phase.phaseDiscount || 0;
      roomDiscountEnabled = true;
    }

    const room = await this.prisma.variantRoom.create({
      data: {
        name: createRoomDto.name,
        area: createRoomDto.area,
        discount: roomDiscount,
        discountEnabled: roomDiscountEnabled,
        variant: {
          connect: { id: variantId },
        },
      },
      include: {
        variant: {
          include: {
            phase: {
              include: {
                project: true,
              },
            },
          },
        },
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return room;
  }

  async findAll() {
    return this.prisma.variantRoom.findMany({
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            phaseId: true,
            phase: {
              select: {
                id: true,
                name: true,
                projectId: true,
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            products: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByVariant(variantId: string) {
    // Verify that variant exists
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.variantRoom.findMany({
      where: { variantId },
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            phaseId: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                nameBg: true,
                saleBgn: true,
                unit: true,
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
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.variantRoom.findUnique({
      where: { id },
      include: {
        variant: {
          include: {
            phase: {
              include: {
                project: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        products: {
          include: {
            product: {
              include: {
                manufacturer: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                  },
                },
                productType: {
                  select: {
                    id: true,
                    name: true,
                    nameBg: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        images: {
          orderBy: {
            uploadedAt: 'asc',
          },
        },
        _count: {
          select: {
            products: true,
            images: true,
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const existingRoom = await this.prisma.variantRoom.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    return this.prisma.variantRoom.update({
      where: { id },
      data: updateRoomDto,
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            phaseId: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                nameBg: true,
                saleBgn: true,
                unit: true,
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
    });
  }

  async remove(id: string) {
    const existingRoom = await this.prisma.variantRoom.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingRoom) {
      throw new NotFoundException('Room not found');
    }

    // Check if room has products
    if (existingRoom._count.products > 0) {
      throw new BadRequestException(
        'Cannot delete room that contains products. Please remove all products first.',
      );
    }

    await this.prisma.variantRoom.delete({
      where: { id },
    });
  }

  async getStats() {
    const total = await this.prisma.variantRoom.count();
    
    const withProducts = await this.prisma.variantRoom.count({
      where: {
        products: {
          some: {},
        },
      },
    });

    const withImages = await this.prisma.variantRoom.count({
      where: {
        images: {
          some: {},
        },
      },
    });

    const averageArea = await this.prisma.variantRoom.aggregate({
      _avg: {
        area: true,
      },
      where: {
        area: {
          not: null,
        },
      },
    });

    const totalProducts = await this.prisma.roomProduct.count();

    return {
      total,
      withProducts,
      withImages,
      emptyRooms: total - withProducts,
      averageArea: averageArea._avg.area || 0,
      totalProducts,
    };
  }

  async duplicateRoom(id: string, options?: {
    name?: string;
    targetVariantId?: string;
    productCloneType?: 'all' | 'selected' | 'none';
    selectedProductIds?: string[];
  }) {
    const originalRoom = await this.findOne(id);
    
    // Determine target variant and product cloning options
    const targetVariantId = options?.targetVariantId || originalRoom.variantId;
    const productCloneType = options?.productCloneType || 'all';
    
    // Verify target variant exists and get phase discount info
    const targetVariant = await this.prisma.phaseVariant.findUnique({
      where: { id: targetVariantId },
      include: {
        phase: {
          select: {
            id: true,
            discountEnabled: true,
            phaseDiscount: true,
          },
        },
      },
    });
    
    if (!targetVariant) {
      throw new NotFoundException('Target variant not found');
    }
    
    // Calculate room discount based on variant and phase settings
    let roomDiscount = 0;
    let roomDiscountEnabled = false;
    
    if (targetVariant.discountEnabled && targetVariant.phase.discountEnabled) {
      // Variant discount is enabled AND phase discount is enabled
      roomDiscount = targetVariant.phase.phaseDiscount || 0;
      roomDiscountEnabled = true;
    } else {
      // Variant discount is disabled OR phase discount is disabled
      roomDiscount = 0;
      roomDiscountEnabled = false;
    }
    
    const duplicatedRoom = await this.prisma.variantRoom.create({
      data: {
        variantId: targetVariantId,
        name: options?.name || `${originalRoom.name} (копие)`,
        area: originalRoom.area,
        discount: roomDiscount,
        discountEnabled: roomDiscountEnabled,
        wastePercent: originalRoom.wastePercent,
      },
      include: {
        variant: {
          select: {
            id: true,
            name: true,
            phaseId: true,
          },
        },
        _count: {
          select: {
            products: true,
            images: true,
          },
        },
      },
    });

    // Copy products based on clone type
    if (productCloneType !== 'none' && originalRoom.products.length > 0) {
      let productsToClone = originalRoom.products;
      
      // Filter products if selective cloning
      if (productCloneType === 'selected' && options?.selectedProductIds) {
        productsToClone = originalRoom.products.filter(p => {
          return options.selectedProductIds!.includes(p.id);
        });
      }
      
      if (productsToClone.length > 0) {
        const productData = productsToClone.map((roomProduct) => ({
          roomId: duplicatedRoom.id,
          productId: roomProduct.productId,
          quantity: roomProduct.quantity,
          unitPrice: roomProduct.unitPrice,
          discount: roomProduct.discount,
          discountEnabled: roomProduct.discountEnabled,
          wastePercent: roomProduct.wastePercent,
        }));

        await this.prisma.roomProduct.createMany({
          data: productData,
        });
      }
    }

    return duplicatedRoom;
  }

  /**
   * Updates room discounts based on variant discount settings
   * Called when variant discountEnabled is changed
   */
  async updateRoomDiscountsForVariant(variantId: string) {
    // Get variant with phase info
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id: variantId },
      include: {
        phase: {
          select: {
            id: true,
            discountEnabled: true,
            phaseDiscount: true,
          },
        },
        rooms: {
          select: {
            id: true,
            name: true,
            discount: true,
            discountEnabled: true,
          },
        },
      },
    });
    
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    
    // Calculate new discount values
    let newRoomDiscount = 0;
    let newRoomDiscountEnabled = false;
    
    if (variant.discountEnabled && variant.phase.discountEnabled) {
      // If both variant and phase discounts are enabled, use phase discount
      newRoomDiscount = variant.phase.phaseDiscount || 0;
      newRoomDiscountEnabled = true;
    } else {
      // If either is disabled, set to 0
      newRoomDiscount = 0;
      newRoomDiscountEnabled = false;
    }
    
    // Update all rooms in this variant using transaction
    await this.prisma.$transaction(async (prisma) => {
      // Update rooms
      await prisma.variantRoom.updateMany({
        where: { variantId },
        data: {
          discount: newRoomDiscount,
          discountEnabled: newRoomDiscountEnabled,
        },
      });
      
      // Update all products in all rooms of this variant
      await prisma.roomProduct.updateMany({
        where: {
          room: {
            variantId: variantId,
          },
        },
        data: {
          discount: newRoomDiscount,
          discountEnabled: newRoomDiscountEnabled,
        },
      });
    });
    
    return {
      updated: true,
      roomsCount: variant.rooms.length,
      newDiscount: newRoomDiscount,
      discountEnabled: newRoomDiscountEnabled,
    };
  }
} 