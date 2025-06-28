import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomProductDto } from './dto/create-room-product.dto';
import { UpdateRoomProductDto } from './dto/update-room-product.dto';

@Injectable()
export class RoomProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomProductDto: CreateRoomProductDto) {
    return this.prisma.projectRoomProduct.create({
      data: createRoomProductDto,
      include: {
        room: {
          include: {
            variant: {
              include: {
                phase: {
                  include: {
                    project: true
                  }
                }
              }
            }
          }
        },
        product: true
      }
    });
  }

  async findAll() {
    return this.prisma.projectRoomProduct.findMany({
      include: {
        room: {
          include: {
            variant: {
              include: {
                phase: {
                  include: {
                    project: {
                      include: {
                        client: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        product: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const roomProduct = await this.prisma.projectRoomProduct.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            variant: {
              include: {
                phase: {
                  include: {
                    project: {
                      include: {
                        client: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        product: true
      }
    });

    if (!roomProduct) {
      throw new NotFoundException(`Room Product with ID ${id} not found`);
    }

    return roomProduct;
  }

  async update(id: string, updateRoomProductDto: UpdateRoomProductDto) {
    // Check if room product exists
    await this.findOne(id);

    return this.prisma.projectRoomProduct.update({
      where: { id },
      data: updateRoomProductDto,
      include: {
        room: true,
        product: true
      }
    });
  }

  async remove(id: string) {
    // Check if room product exists
    await this.findOne(id);

    return this.prisma.projectRoomProduct.delete({
      where: { id }
    });
  }

  async findByRoom(roomId: string) {
    return this.prisma.projectRoomProduct.findMany({
      where: { roomId },
      include: {
        room: true,
        product: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
} 