import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    try {
      // Validate client exists
      const client = await this.prisma.client.findUnique({
        where: { id: createProjectDto.clientId }
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }

      // Validate architect if external
      if (createProjectDto.architectType === 'external' && createProjectDto.architectId) {
        const architect = await this.prisma.client.findUnique({
          where: { id: createProjectDto.architectId }
        });
        
        if (!architect || !architect.isArchitect) {
          throw new BadRequestException('Invalid architect selected');
        }
      }

      // Create project with contacts
      const project = await this.prisma.project.create({
        data: {
          clientId: createProjectDto.clientId,
          name: createProjectDto.name,
          projectType: createProjectDto.projectType,
          address: createProjectDto.address,
          description: createProjectDto.description,
          city: createProjectDto.city || 'София',
          totalArea: createProjectDto.totalArea,
          roomsCount: createProjectDto.roomsCount,
          floorsCount: createProjectDto.floorsCount,
          estimatedBudget: createProjectDto.estimatedBudget,
          startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : null,
          expectedCompletionDate: createProjectDto.expectedCompletionDate ? new Date(createProjectDto.expectedCompletionDate) : null,
          architectType: createProjectDto.architectType,
          architectId: createProjectDto.architectId,
          architectName: createProjectDto.architectName,
          architectCommission: createProjectDto.architectCommission,
          architectPhone: createProjectDto.architectPhone,
          architectEmail: createProjectDto.architectEmail,
          status: 'draft',
          contacts: {
            create: createProjectDto.contacts?.map(contact => ({
              name: contact.name,
              phone: contact.phone,
              email: contact.email,
              role: contact.role,
              receivesOffers: contact.receivesOffers,
              receivesInvoices: contact.receivesInvoices,
              receivesUpdates: contact.receivesUpdates,
              isPrimary: contact.isPrimary
            })) || []
          }
        },
        include: {
          client: true,
          architect: true,
          contacts: true
        }
      });

      return {
        success: true,
        data: project,
        message: 'Project created successfully',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create project');
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    clientId?: string;
    projectType?: string;
    status?: string;
  } = {}) {
    const page = options.page || 1;
    const limit = Math.min(options.limit || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {
      deletedAt: null // Only non-deleted projects
    };

    if (options.clientId) {
      where.clientId = options.clientId;
    }

    if (options.projectType) {
      where.projectType = options.projectType;
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { city: { contains: searchTerm, mode: 'insensitive' } },
        { architectName: { contains: searchTerm, mode: 'insensitive' } },
        { client: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
        { client: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
        { client: { companyName: { contains: searchTerm, mode: 'insensitive' } } }
      ];
    }

    // Execute queries in parallel
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
              hasCompany: true,
              isArchitect: true
            }
          },
          architect: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true
            }
          },
          contacts: true,
          _count: {
            select: {
              phases: true,
              offers: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      this.prisma.project.count({ where })
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
        deletedAt: null
      },
      include: {
        client: true,
        architect: true,
        contacts: true,
        phases: {
          include: {
            variants: {
              include: {
                rooms: {
                  include: {
                    products: {
                      include: {
                        product: true
                      }
                    }
                  }
                }
              }
            }
          },
          orderBy: { phaseOrder: 'asc' }
        },
        offers: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Latest 5 offers
        }
      }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return {
      success: true,
      data: project
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Check if project exists
    const existingProject = await this.prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!existingProject) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Validate client if changed
    if (updateProjectDto.clientId && updateProjectDto.clientId !== existingProject.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateProjectDto.clientId }
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }
    }

    // Validate architect if external and changed
    if (updateProjectDto.architectType === 'external' && updateProjectDto.architectId) {
      const architect = await this.prisma.client.findUnique({
        where: { id: updateProjectDto.architectId }
      });
      
      if (!architect || !architect.isArchitect) {
        throw new BadRequestException('Invalid architect selected');
      }
    }

    try {
      const updatedProject = await this.prisma.project.update({
        where: { id },
        data: {
          ...(updateProjectDto.name && { name: updateProjectDto.name }),
          ...(updateProjectDto.projectType && { projectType: updateProjectDto.projectType }),
          ...(updateProjectDto.address !== undefined && { address: updateProjectDto.address }),
          ...(updateProjectDto.description !== undefined && { description: updateProjectDto.description }),
          ...(updateProjectDto.city && { city: updateProjectDto.city }),
          ...(updateProjectDto.totalArea !== undefined && { totalArea: updateProjectDto.totalArea }),
          ...(updateProjectDto.roomsCount !== undefined && { roomsCount: updateProjectDto.roomsCount }),
          ...(updateProjectDto.floorsCount !== undefined && { floorsCount: updateProjectDto.floorsCount }),
          ...(updateProjectDto.estimatedBudget !== undefined && { estimatedBudget: updateProjectDto.estimatedBudget }),
          ...(updateProjectDto.startDate !== undefined && { 
            startDate: updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : null 
          }),
          ...(updateProjectDto.expectedCompletionDate !== undefined && { 
            expectedCompletionDate: updateProjectDto.expectedCompletionDate ? new Date(updateProjectDto.expectedCompletionDate) : null 
          }),
          ...(updateProjectDto.architectType && { architectType: updateProjectDto.architectType }),
          ...(updateProjectDto.architectId !== undefined && { architectId: updateProjectDto.architectId }),
          ...(updateProjectDto.architectName !== undefined && { architectName: updateProjectDto.architectName }),
          ...(updateProjectDto.architectCommission !== undefined && { architectCommission: updateProjectDto.architectCommission }),
          ...(updateProjectDto.architectPhone !== undefined && { architectPhone: updateProjectDto.architectPhone }),
          ...(updateProjectDto.architectEmail !== undefined && { architectEmail: updateProjectDto.architectEmail }),
          ...(updateProjectDto.status && { status: updateProjectDto.status }),
        },
        include: {
          client: true,
          architect: true,
          contacts: true
        }
      });

      return {
        success: true,
        data: updatedProject,
        message: 'Project updated successfully'
      };

    } catch (error) {
      throw new BadRequestException('Failed to update project');
    }
  }

  async remove(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      success: true,
      message: 'Project deleted successfully'
    };
  }

  async toggleActive(id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const newStatus = project.status === 'active' ? 'draft' : 'active';

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { status: newStatus },
      include: {
        client: true,
        architect: true
      }
    });

    return {
      success: true,
      data: updatedProject,
      message: `Project ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
    };
  }

  async getStats() {
    const [
      total,
      active,
      completed,
      draft,
      byType,
      withArchitect,
      thisMonth,
      thisYear
    ] = await Promise.all([
      // Total projects
      this.prisma.project.count({
        where: { deletedAt: null }
      }),
      // Active projects
      this.prisma.project.count({
        where: { 
          status: 'active',
          deletedAt: null 
        }
      }),
      // Completed projects
      this.prisma.project.count({
        where: { 
          status: 'completed',
          deletedAt: null 
        }
      }),
      // Draft projects
      this.prisma.project.count({
        where: { 
          status: 'draft',
          deletedAt: null 
        }
      }),
      // By project type
      this.prisma.project.groupBy({
        by: ['projectType'],
        where: { deletedAt: null },
        _count: true
      }),
      // With architect
      this.prisma.project.count({
        where: {
          OR: [
            { architectType: 'client' },
            { architectType: 'external' }
          ],
          deletedAt: null
        }
      }),
      // This month
      this.prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          deletedAt: null
        }
      }),
      // This year
      this.prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1)
          },
          deletedAt: null
        }
      })
    ]);

    // Transform byType results
    const typeStats = {
      apartment: 0,
      house: 0,
      office: 0,
      commercial: 0,
      other: 0
    };

    byType.forEach(item => {
      if (item.projectType in typeStats) {
        typeStats[item.projectType as keyof typeof typeStats] = item._count;
      }
    });

    return {
      success: true,
      data: {
        total,
        active,
        completed,
        draft,
        withArchitect,
        thisMonth,
        thisYear,
        byType: typeStats,
        byStatus: {
          active,
          completed,
          draft,
          archived: 0 // We don't have archived status yet
        }
      },
    };
  }

  // Additional utility methods
  async getProjectsByClient(clientId: string) {
    const projects = await this.prisma.project.findMany({
      where: {
        clientId,
        deletedAt: null
      },
      include: {
        contacts: true,
        _count: {
          select: {
            phases: true,
            offers: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      success: true,
      data: projects
    };
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['draft', 'active', 'completed', 'archived'];
    
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        architect: true
      }
    });

    return {
      success: true,
      data: updatedProject,
      message: `Project status updated to ${status}`
    };
  }
} 