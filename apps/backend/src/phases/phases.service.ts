import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';

@Injectable()
export class PhasesService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, createPhaseDto: CreatePhaseDto) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Get the next available phase order
    const existingPhases = await this.prisma.projectPhase.findMany({
      where: { projectId },
      orderBy: { phaseOrder: 'desc' },
      take: 1,
    });

    const nextPhaseOrder = existingPhases.length > 0 ? existingPhases[0].phaseOrder + 1 : 1;

    const phase = await this.prisma.projectPhase.create({
      data: {
        projectId,
        name: createPhaseDto.name,
        description: createPhaseDto.description,
        phaseOrder: nextPhaseOrder,
        status: createPhaseDto.status || 'created',
        includeArchitectCommission: createPhaseDto.includeArchitectCommission || false,
        discountEnabled: createPhaseDto.discountEnabled || false,
        phaseDiscount: createPhaseDto.phaseDiscount || 0,
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

    return {
      success: true,
      data: phase,
      message: 'Phase created successfully',
    };
  }

  async findAll() {
    const phases = await this.prisma.projectPhase.findMany({
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

    return {
      success: true,
      data: phases,
      message: 'Phases retrieved successfully',
    };
  }

  async findByProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const phases = await this.prisma.projectPhase.findMany({
      where: { projectId },
      orderBy: { phaseOrder: 'asc' },
    });

    return {
      success: true,
      data: phases,
      message: 'Phases retrieved successfully',
    };
  }

  async getStats() {
    const [totalPhases, statusStats] = await Promise.all([
      this.prisma.projectPhase.count(),
      this.prisma.projectPhase.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const stats = {
      total: totalPhases,
      byStatus: statusStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {} as Record<string, number>),
    };

    return {
      success: true,
      data: stats,
      message: 'Phase stats retrieved successfully',
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

    return {
      success: true,
      data: phase,
      message: 'Phase retrieved successfully',
    };
  }

  /**
   * Cascading update method: Updates all variants in a phase when phase discount changes
   */
  private async cascadeDiscountToVariants(phaseId: string, phaseDiscount: number, discountEnabled: boolean) {
    // Get all variants for this phase
    const variants = await this.prisma.phaseVariant.findMany({
      where: { phaseId },
      include: {
        rooms: {
          include: {
            products: true,
          },
        },
      },
    });

    // Update each variant using a transaction
    await this.prisma.$transaction(async (prisma) => {
      for (const variant of variants) {
        // Update variant discount
        await prisma.phaseVariant.update({
          where: { id: variant.id },
          data: {
            discountEnabled: discountEnabled,
            variantDiscount: discountEnabled ? phaseDiscount : 0,
          },
        });

        // Cascade to all rooms in this variant
        for (const room of variant.rooms) {
          await prisma.variantRoom.update({
            where: { id: room.id },
            data: {
              discountEnabled: discountEnabled,
              discount: discountEnabled ? phaseDiscount : 0,
            },
          });

          // Cascade to all products in this room
          await prisma.roomProduct.updateMany({
            where: { roomId: room.id },
            data: {
              discountEnabled: discountEnabled,
              discount: discountEnabled ? phaseDiscount : 0,
            },
          });
        }
      }
    });

    return variants.length;
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

    // Check if discount settings are being changed
    const isDiscountChanged = 
      (updatePhaseDto.discountEnabled !== undefined && updatePhaseDto.discountEnabled !== phase.discountEnabled) ||
      (updatePhaseDto.phaseDiscount !== undefined && updatePhaseDto.phaseDiscount !== phase.phaseDiscount);

    const updatedPhase = await this.prisma.projectPhase.update({
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

    // If discount settings changed, cascade to all variants, rooms, and products
    if (isDiscountChanged) {
      const newDiscountEnabled = updatePhaseDto.discountEnabled ?? phase.discountEnabled;
      const newPhaseDiscount = updatePhaseDto.phaseDiscount ?? phase.phaseDiscount ?? 0;
      
      await this.cascadeDiscountToVariants(id, newPhaseDiscount, newDiscountEnabled);
    }

    return {
      success: true,
      data: updatedPhase,
      message: 'Phase updated successfully',
    };
  }

  async reorderPhases(projectId: string, phaseOrders: { phaseId: string; newOrder: number }[]) {
    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Update all phases in a transaction using temporary values to avoid constraint conflicts
    await this.prisma.$transaction(async (prisma) => {
      // First pass: Set all phases to temporary negative values to avoid conflicts
      for (let i = 0; i < phaseOrders.length; i++) {
        const { phaseId } = phaseOrders[i];
        await prisma.projectPhase.update({
          where: { id: phaseId },
          data: { phaseOrder: -(i + 1000) }, // Use negative numbers to avoid conflicts
        });
      }

      // Second pass: Set the actual new orders
      for (const { phaseId, newOrder } of phaseOrders) {
        await prisma.projectPhase.update({
          where: { id: phaseId },
          data: { phaseOrder: newOrder },
        });
      }
    });

    return {
      success: true,
      message: 'Phases reordered successfully',
    };
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

    const deletedPhase = await this.prisma.projectPhase.delete({
      where: { id },
    });

    return {
      success: true,
      data: deletedPhase,
      message: 'Phase deleted successfully',
    };
  }
} 