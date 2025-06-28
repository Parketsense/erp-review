import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    return this.prisma.projectRoom.create({
      data: createRoomDto,
      include: {
        variant: {
          include: {
            phase: {
              include: {
                project: true
              }
            }
          }
        },
        products: true
      }
    });
  }

  async findAll() {
    return this.prisma.projectRoom.findMany({
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
        },
        products: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.projectRoom.findUnique({
      where: { id },
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
        },
        products: true
      }
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    // Check if room exists
    await this.findOne(id);

    return this.prisma.projectRoom.update({
      where: { id },
      data: updateRoomDto,
      include: {
        variant: true,
        products: true
      }
    });
  }

  async remove(id: string) {
    // Check if room exists
    await this.findOne(id);

    return this.prisma.projectRoom.delete({
      where: { id }
    });
  }

  async findByVariant(variantId: string) {
    return this.prisma.projectRoom.findMany({
      where: { variantId },
      include: {
        variant: true,
        products: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
} 