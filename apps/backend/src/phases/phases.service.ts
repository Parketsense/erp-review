import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createPhaseDto: CreatePhaseDto) {
    // Проверяваме дали проектът съществува
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Ако не е зададен phaseOrder, намираме следващия
    let phaseOrder = createPhaseDto.phaseOrder;
    if (!phaseOrder) {
      const lastPhase = await this.prisma.projectPhase.findFirst({
        where: { projectId },
        orderBy: { phaseOrder: 'desc' },
      });
      phaseOrder = lastPhase ? lastPhase.phaseOrder + 1 : 1;
    }

    // Проверяваме дали вече съществува фаза с този номер
    const existingPhase = await this.prisma.projectPhase.findUnique({
      where: {
        projectId_phaseOrder: {
          projectId,
          phaseOrder,
        },
      },
    });

    if (existingPhase) {
      throw new BadRequestException(`Phase with order ${phaseOrder} already exists for this project`);
    }

    return this.prisma.projectPhase.create({
      data: {
        projectId,
        name: createPhaseDto.name,
        description: createPhaseDto.description,
        phaseOrder,
        status: createPhaseDto.status || 'created',
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
    });
  }

  async findAll() {
    return this.prisma.projectPhase.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        variants: true,
      },
      orderBy: [
        { project: { name: 'asc' } },
        { phaseOrder: 'asc' },
      ],
    });
  }

  async findByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return this.prisma.projectPhase.findMany({
      where: { projectId },
      orderBy: { phaseOrder: 'asc' },
    });
  }

  async getStats() {
    const [totalPhases, statusStats] = await Promise.all([
      this.prisma.projectPhase.count(),
      this.prisma.projectPhase.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total: totalPhases,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  async findOne(id: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        variants: {
          include: {
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
        },
      },
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return phase;
  }

  async update(id: string, updatePhaseDto: UpdatePhaseDto) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id },
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    // Ако се опитват да променят phaseOrder, проверяваме конфликти
    if (updatePhaseDto.phaseOrder && updatePhaseDto.phaseOrder !== phase.phaseOrder) {
      const existingPhase = await this.prisma.projectPhase.findUnique({
        where: {
          projectId_phaseOrder: {
            projectId: phase.projectId,
            phaseOrder: updatePhaseDto.phaseOrder,
          },
        },
      });

      if (existingPhase && existingPhase.id !== id) {
        throw new BadRequestException(`Phase with order ${updatePhaseDto.phaseOrder} already exists for this project`);
      }
    }

    return this.prisma.projectPhase.update({
      where: { id },
      data: updatePhaseDto,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
    });
  }

  async reorderPhases(projectId: string, phaseOrders: { id: string; phaseOrder: number }[]) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Проверяваме дали всички фази принадлежат на проекта
    const phaseIds = phaseOrders.map(p => p.id);
    const phases = await this.prisma.projectPhase.findMany({
      where: { 
        id: { in: phaseIds },
        projectId 
      },
    });

    if (phases.length !== phaseIds.length) {
      throw new BadRequestException('Some phases do not belong to this project');
    }

    // Проверяваме дали всички номера са уникални
    const orders = phaseOrders.map(p => p.phaseOrder);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
      throw new BadRequestException('Phase orders must be unique');
    }

    // Изпълняваме промените в транзакция
    return this.prisma.$transaction(async (prisma) => {
      const updates = phaseOrders.map(({ id, phaseOrder }) =>
        prisma.projectPhase.update({
          where: { id },
          data: { phaseOrder },
        })
      );
      
      return Promise.all(updates);
    });
  }

  async remove(id: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id },
      include: {
        variants: {
          include: {
            _count: {
              select: {
                rooms: true,
              },
            },
          },
        },
      },
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    // Проверяваме дали има варианти с данни
    const hasVariantsWithRooms = phase.variants.some(variant => variant._count.rooms > 0);
    if (hasVariantsWithRooms) {
      throw new BadRequestException('Cannot delete phase with variants that contain rooms and products');
    }

    return this.prisma.projectPhase.delete({
      where: { id },
    });
  }
} 