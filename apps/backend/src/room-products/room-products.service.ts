import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomProductDto } from './dto/create-room-product.dto';
import { UpdateRoomProductDto } from './dto/update-room-product.dto';

@Injectable()
export class RoomProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomProductDto: CreateRoomProductDto) {
    try {
      // Validate room exists and get discount info
      const room = await this.prisma.variantRoom.findUnique({
        where: { id: createRoomProductDto.roomId },
        include: {
          variant: {
            include: {
              phase: {
                select: {
                  id: true,
                  discountEnabled: true,
                  phaseDiscount: true,
                },
              },
            },
          },
        },
      });
      if (!room) {
        throw new NotFoundException('Room not found');
      }

      // Validate product exists
      const product = await this.prisma.product.findUnique({
        where: { id: createRoomProductDto.productId },
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Check if product already exists in room
      const existingProduct = await this.prisma.roomProduct.findFirst({
        where: {
          roomId: createRoomProductDto.roomId,
          productId: createRoomProductDto.productId,
        },
      });

      if (existingProduct) {
        throw new BadRequestException('Product already exists in this room');
      }

      // Calculate product discount based on room/variant/phase settings
      let productDiscount = createRoomProductDto.discount || 0;
      let productDiscountEnabled = createRoomProductDto.discountEnabled ?? true;
      
      // Override discount based on room/variant/phase settings
      if (!room.variant.discountEnabled || !room.variant.phase.discountEnabled || !room.discountEnabled) {
        // If variant, phase, or room discount is disabled, set product discount to 0
        productDiscount = 0;
        productDiscountEnabled = false;
      } else if (createRoomProductDto.discount === undefined) {
        // If no specific discount provided, use room discount (which should already be set based on phase)
        productDiscount = room.discount || 0;
        productDiscountEnabled = true;
      }

      const roomProduct = await this.prisma.roomProduct.create({
        data: {
          roomId: createRoomProductDto.roomId,
          productId: createRoomProductDto.productId,
          quantity: createRoomProductDto.quantity,
          unitPrice: createRoomProductDto.unitPrice,
          discount: productDiscount,
          discountEnabled: productDiscountEnabled,
          wastePercent: createRoomProductDto.wastePercent || 10,
        },
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
          room: {
            select: {
              id: true,
              name: true,
              variantId: true,
            },
          },
        },
      });

      return {
        success: true,
        data: roomProduct,
        message: 'Product added to room successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add product to room');
    }
  }

  async findByRoom(roomId: string) {
    try {
      const roomProducts = await this.prisma.roomProduct.findMany({
        where: { roomId },
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
      });

      return {
        success: true,
        data: roomProducts,
        message: 'Room products retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve room products');
    }
  }

  async findOne(id: string) {
    try {
      const roomProduct = await this.prisma.roomProduct.findUnique({
        where: { id },
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
          room: {
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
            },
          },
        },
      });

      if (!roomProduct) {
        throw new NotFoundException('Room product not found');
      }

      return {
        success: true,
        data: roomProduct,
        message: 'Room product retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve room product');
    }
  }

  async update(id: string, updateRoomProductDto: UpdateRoomProductDto) {
    try {
      const existingProduct = await this.prisma.roomProduct.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Room product not found');
      }

      const updatedProduct = await this.prisma.roomProduct.update({
        where: { id },
        data: updateRoomProductDto,
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
          room: {
            select: {
              id: true,
              name: true,
              variantId: true,
            },
          },
        },
      });

      return {
        success: true,
        data: updatedProduct,
        message: 'Room product updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update room product');
    }
  }

  async remove(id: string) {
    try {
      const existingProduct = await this.prisma.roomProduct.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        throw new NotFoundException('Room product not found');
      }

      await this.prisma.roomProduct.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Room product deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete room product');
    }
  }

  async getStats() {
    try {
      const [totalProducts, totalRooms, totalQuantity] = await Promise.all([
        this.prisma.roomProduct.count(),
        this.prisma.roomProduct.groupBy({
          by: ['roomId'],
          _count: {
            roomId: true,
          },
        }),
        this.prisma.roomProduct.aggregate({
          _sum: {
            quantity: true,
          },
        }),
      ]);

      return {
        success: true,
        data: {
          totalProducts,
          totalRooms: totalRooms.length,
          totalQuantity: totalQuantity._sum.quantity || 0,
        },
        message: 'Room products stats retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve room products stats');
    }
  }
} 