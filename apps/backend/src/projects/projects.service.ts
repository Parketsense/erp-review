import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    // Проверяваме дали клиентът съществува
    const client = await this.prisma.client.findUnique({
      where: { id: createProjectDto.clientId },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${createProjectDto.clientId} not found`);
    }

    // Ако има архитект, проверяваме дали съществува
    if (createProjectDto.architectId) {
      const architect = await this.prisma.client.findUnique({
        where: { 
          id: createProjectDto.architectId,
          isArchitect: true 
        },
      });

      if (!architect) {
        throw new NotFoundException(`Architect with ID ${createProjectDto.architectId} not found`);
      }
    }

    const project = await this.prisma.project.create({
      data: createProjectDto,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hasCompany: true,
            companyName: true,
          },
        },
        architect: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            commissionPercent: true,
          },
        },
        phases: {
          orderBy: { phaseOrder: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: project,
      message: 'Project created successfully',
    };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    projectType?: string;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null, // Не показваме изтритите проекти
    };

    if (options.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
        { address: { contains: options.search, mode: 'insensitive' } },
        { 
          client: {
            OR: [
              { firstName: { contains: options.search, mode: 'insensitive' } },
              { lastName: { contains: options.search, mode: 'insensitive' } },
              { companyName: { contains: options.search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (options.clientId) {
      where.clientId = options.clientId;
    }

    if (options.projectType) {
      where.projectType = options.projectType;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              hasCompany: true,
              companyName: true,
            },
          },
          architect: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          phases: {
            select: {
              id: true,
              name: true,
              status: true,
              phaseOrder: true,
            },
            orderBy: { phaseOrder: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        client: true,
        architect: true,
        contacts: {
          orderBy: { createdAt: 'asc' },
        },
        phases: {
          include: {
            variants: {
              include: {
                rooms: {
                  include: {
                    products: {
                      include: {
                        product: {
                          select: {
                            id: true,
                            code: true,
                            nameBg: true,
                            nameEn: true,
                            unit: true,
                            costBgn: true,
                            saleBgn: true,
                          },
                        },
                      },
                    },
                    images: true,
                  },
                },
              },
              orderBy: { variantOrder: 'asc' },
            },
          },
          orderBy: { phaseOrder: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      success: true,
      data: project,
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const existingProject = await this.prisma.project.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Ако се сменя клиентът, проверяваме дали новият съществува
    if (updateProjectDto.clientId && updateProjectDto.clientId !== existingProject.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateProjectDto.clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${updateProjectDto.clientId} not found`);
      }
    }

    // Ако се сменя архитектът, проверяваме дали новият съществува
    if (updateProjectDto.architectId && updateProjectDto.architectId !== existingProject.architectId) {
      const architect = await this.prisma.client.findUnique({
        where: { 
          id: updateProjectDto.architectId,
          isArchitect: true 
        },
      });

      if (!architect) {
        throw new NotFoundException(`Architect with ID ${updateProjectDto.architectId} not found`);
      }
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hasCompany: true,
            companyName: true,
          },
        },
        architect: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        phases: {
          orderBy: { phaseOrder: 'asc' },
        },
      },
    });

    return {
      success: true,
      data: project,
      message: 'Project updated successfully',
    };
  }

  async remove(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
      include: {
        phases: {
          include: {
            variants: {
              include: {
                rooms: {
                  include: {
                    products: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Проверяваме дали има фази с данни
    const hasDataInPhases = project.phases.some(phase =>
      phase.variants.some(variant =>
        variant.rooms.some(room => room.products.length > 0)
      )
    );

    if (hasDataInPhases) {
      // Soft delete
      await this.prisma.project.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } else {
      // Hard delete if no data
      await this.prisma.project.delete({
        where: { id },
      });
    }

    return {
      success: true,
      message: 'Project deleted successfully',
    };
  }

  async toggleActive(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // За проектите няма isActive поле, така че променяме статуса между 'active' и 'archived'
    const newStatus = project.status === 'active' ? 'archived' : 'active';

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { status: newStatus },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedProject,
      message: `Project ${newStatus === 'active' ? 'activated' : 'archived'} successfully`,
    };
  }

  async getStats() {
    const [
      total,
      byStatus,
      byType,
      withPhases,
    ] = await Promise.all([
      this.prisma.project.count({
        where: { deletedAt: null },
      }),
      this.prisma.project.groupBy({
        by: ['status'],
        _count: true,
        where: { deletedAt: null },
      }),
      this.prisma.project.groupBy({
        by: ['projectType'],
        _count: true,
        where: { deletedAt: null },
      }),
      this.prisma.project.count({
        where: { 
          deletedAt: null,
          phases: {
            some: {},
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        total,
        withPhases,
        byStatus: byStatus.reduce((acc, stat) => {
          acc[stat.status] = stat._count;
          return acc;
        }, {} as Record<string, number>),
        byType: byType.reduce((acc, stat) => {
          acc[stat.projectType] = stat._count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  }
} 