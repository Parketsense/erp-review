import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(variantId: string, createRoomDto: CreateRoomDto) {
    // Verify that variant exists
    const variant = await this.prisma.phaseVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    return this.prisma.variantRoom.create({
      data: {
        variantId,
        name: createRoomDto.name,
        area: createRoomDto.area,
        discount: createRoomDto.discount ?? 0,
        discountEnabled: createRoomDto.discountEnabled ?? true,
        wastePercent: createRoomDto.wastePercent ?? 10,
      },
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

  async duplicateRoom(id: string, newName?: string) {
    const originalRoom = await this.findOne(id);
    
    const duplicatedRoom = await this.prisma.variantRoom.create({
      data: {
        variantId: originalRoom.variantId,
        name: newName || `${originalRoom.name} (копие)`,
        area: originalRoom.area,
        discount: originalRoom.discount,
        discountEnabled: originalRoom.discountEnabled,
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

    // Copy products if any exist
    if (originalRoom.products.length > 0) {
      const productData = originalRoom.products.map((roomProduct) => ({
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

    return duplicatedRoom;
  }
} 