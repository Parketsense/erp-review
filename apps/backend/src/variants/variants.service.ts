import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class VariantsService {
  constructor(
    private prisma: PrismaService,
    private roomsService: RoomsService,
  ) {}

  async create(createVariantDto: CreateVariantDto) {
    const { phaseId, variantOrder, ...data } = createVariantDto;

    // Get the phase to validate it exists and get project info
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        project: {
          select: {
            architectName: true,
            architectCommission: true,
          },
        },
      },
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

    // Auto-populate architect from project if not provided
    const variantData = {
      phaseId,
      variantOrder: order,
      ...data,
    };

    // If architect is not provided, inherit from project
    if (!variantData.architect && phase.project?.architectName) {
      variantData.architect = phase.project.architectName;
    }

    // If architect commission is not provided, inherit from project
    if (!variantData.architectCommission && phase.project?.architectCommission) {
      variantData.architectCommission = phase.project.architectCommission;
    }

    // Create the variant
    const variant = await this.prisma.phaseVariant.create({
      data: variantData,
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

  async findByProject(projectId: string) {
    const variants = await this.prisma.phaseVariant.findMany({
      where: {
        phase: {
          projectId: projectId,
        },
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
      orderBy: [
        { phase: { phaseOrder: 'asc' } },
        { variantOrder: 'asc' },
      ],
    });

    return {
      success: true,
      data: variants,
      message: 'Project variants retrieved successfully'
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

    // Check if discountEnabled is being changed
    const isDiscountEnabledChanged = updateVariantDto.discountEnabled !== undefined && 
                                    updateVariantDto.discountEnabled !== existingVariant.discountEnabled;

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

    // If discountEnabled was changed, update all room discounts
    if (isDiscountEnabledChanged) {
      await this.roomsService.updateRoomDiscountsForVariant(id);
    }

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

  async duplicateVariant(id: string, options?: {
    name?: string;
    targetPhaseId?: string;
    cloneType?: 'all' | 'selected';
    selectedRoomIds?: string[];
    includeProducts?: boolean;
  }) {
    // Find the original variant with all its rooms and products
    const originalVariant = await this.prisma.phaseVariant.findUnique({
      where: { id },
      include: {
        phase: true,
        rooms: {
          include: {
            products: {
              include: {
                product: true,
              },
            },
            images: true,
          },
        },
      },
    });

    if (!originalVariant) {
      throw new NotFoundException('Variant not found');
    }

    // Determine target phase and room selection
    const targetPhaseId = options?.targetPhaseId || originalVariant.phaseId;
    const includeProducts = options?.includeProducts !== false;
    const cloneType = options?.cloneType || 'all';
    
    // Filter rooms based on clone type
    const roomsToClone = cloneType === 'selected' && options?.selectedRoomIds
      ? originalVariant.rooms.filter(room => options.selectedRoomIds!.includes(room.id))
      : originalVariant.rooms;

    // Get the next order number for the new variant in target phase
    const lastVariant = await this.prisma.phaseVariant.findFirst({
      where: { phaseId: targetPhaseId },
      orderBy: { variantOrder: 'desc' },
    });
    const nextOrder = (lastVariant?.variantOrder || 0) + 1;

    // Create the new variant with transaction to ensure data consistency
    return await this.prisma.$transaction(async (tx) => {
      // Create the duplicated variant
      const duplicatedVariant = await tx.phaseVariant.create({
        data: {
          phaseId: targetPhaseId,
          name: options?.name || `${originalVariant.name} (копие)`,
          designer: originalVariant.designer,
          architect: originalVariant.architect,
          architectCommission: originalVariant.architectCommission,
          variantDiscount: originalVariant.variantDiscount,
          discountEnabled: originalVariant.discountEnabled,
          includeInOffer: false, // Set to false for new variants
          variantOrder: nextOrder,
        },
        include: {
          phase: {
            include: {
              project: true,
            },
          },
          _count: {
            select: {
              rooms: true,
            },
          },
        },
      });

      // Copy selected rooms from the original variant
      if (roomsToClone.length > 0) {
        for (const originalRoom of roomsToClone) {
          // Create the duplicated room
          const duplicatedRoom = await tx.variantRoom.create({
            data: {
              variantId: duplicatedVariant.id,
              name: originalRoom.name,
              area: originalRoom.area,
              discount: originalRoom.discount,
              discountEnabled: originalRoom.discountEnabled,
              wastePercent: originalRoom.wastePercent,
            },
          });

          // Copy products only if includeProducts is true
          if (includeProducts && originalRoom.products.length > 0) {
            const productData = originalRoom.products.map((roomProduct) => ({
              roomId: duplicatedRoom.id,
              productId: roomProduct.productId,
              quantity: roomProduct.quantity,
              unitPrice: roomProduct.unitPrice,
              discount: roomProduct.discount,
              discountEnabled: roomProduct.discountEnabled,
              wastePercent: roomProduct.wastePercent,
            }));

            await tx.roomProduct.createMany({
              data: productData,
            });
          }

          // Note: Images are not copied in this implementation
          // If image copying is needed, it would require additional logic
          // to copy image files and create new image records
        }
      }

      // Return the fully populated variant
      return await tx.phaseVariant.findUnique({
        where: { id: duplicatedVariant.id },
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

  /**
   * Manually trigger room discount updates for a variant
   * Used for testing and debugging
   */
  async updateRoomDiscountsManually(variantId: string) {
    await this.roomsService.updateRoomDiscountsForVariant(variantId);
  }

  async selectVariant(variantId: string) {
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id: variantId },
      include: {
        phase: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Use transaction to ensure only one variant is selected per phase
    return await this.prisma.$transaction(async (tx) => {
      // First, unselect all variants in this phase
      await tx.phaseVariant.updateMany({
        where: { phaseId: variant.phaseId },
        data: { isSelected: false },
      });

      // Then select the specified variant
      const updatedVariant = await tx.phaseVariant.update({
        where: { id: variantId },
        data: { isSelected: true },
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
        data: updatedVariant,
        message: 'Variant selected successfully'
      };
    });
  }

  async getVariantsForOffer(phaseId: string) {
    const variants = await this.prisma.phaseVariant.findMany({
      where: { 
        phaseId,
        includeInOffer: true // Only include variants that should be in offers
      },
      include: {
        phase: {
          select: {
            id: true,
            name: true,
            phaseDiscount: true,
            discountEnabled: true
          }
        },
        rooms: {
          include: {
            products: {
              include: {
                product: {
                  include: {
                    manufacturer: {
                      select: {
                        id: true,
                        name: true,
                        discount: true
                      }
                    },
                    productType: {
                      select: {
                        id: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { variantOrder: 'asc' }
    });

    // Transform variants to match frontend expectations
    return variants.map(variant => ({
      id: variant.id,
      name: variant.name,
      description: variant.description,
      totalPrice: this.calculateVariantTotal(variant),
      rooms: variant.rooms.map(room => ({
        id: room.id,
        name: room.name,
        productCount: room.products.length,
        totalPrice: this.calculateRoomTotal(room)
      }))
    }));
  }

  private calculateVariantTotal(variant: any): number {
    return variant.rooms.reduce((total: number, room: any) => {
      return total + this.calculateRoomTotal(room);
    }, 0);
  }

  private calculateRoomTotal(room: any): number {
    return room.products.reduce((total: number, product: any) => {
      const discount = product.discount || 0;
      const productTotal = product.quantity * product.unitPrice * (1 - discount / 100);
      return total + productTotal;
    }, 0);
  }
} 