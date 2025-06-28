import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  async create(createPhaseDto: CreatePhaseDto) {
    return this.prisma.projectPhase.create({
      data: createPhaseDto,
      include: {
        project: true,
        variants: {
          include: {
            rooms: {
              include: {
                products: true
              }
            }
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.projectPhase.findMany({
      include: {
        project: {
          include: {
            client: true
          }
        },
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            client: true
          }
        },
        variants: {
          include: {
            rooms: {
              include: {
                products: true
              }
            }
          }
        }
      }
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return phase;
  }

  async update(id: string, updatePhaseDto: UpdatePhaseDto) {
    // Check if phase exists
    await this.findOne(id);

    return this.prisma.projectPhase.update({
      where: { id },
      data: updatePhaseDto,
      include: {
        project: true,
        variants: true
      }
    });
  }

  async remove(id: string) {
    // Check if phase exists
    await this.findOne(id);

    return this.prisma.projectPhase.delete({
      where: { id }
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.projectPhase.findMany({
      where: { projectId },
      include: {
        project: true,
        variants: {
          include: {
            rooms: {
              include: {
                products: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
} 