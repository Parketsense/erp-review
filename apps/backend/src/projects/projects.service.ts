import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, CreateProjectContactDto } from './dto/create-project.dto';
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

    // Извличаме контактите от DTO
    const { contacts, ...projectData } = createProjectDto;

    // Създаваме проекта с контактите в транзакция
    const project = await this.prisma.$transaction(async (prisma) => {
      // Създаваме проекта
      const newProject = await prisma.project.create({
        data: projectData,
      });

      // Създаваме контактите ако има такива
      if (contacts && contacts.length > 0) {
        // Проверяваме че само един контакт е primary
        const primaryContacts = contacts.filter(c => c.isPrimary);
        if (primaryContacts.length > 1) {
          throw new BadRequestException('Only one contact can be primary');
        }

        // Ако няма primary контакт, правим първия primary
        if (primaryContacts.length === 0 && contacts.length > 0) {
          contacts[0].isPrimary = true;
        }

        await prisma.projectContact.createMany({
          data: contacts.map(contact => ({
            ...contact,
            projectId: newProject.id,
          })),
        });
      }

      // Връщаме пълната информация за проекта
      return prisma.project.findUnique({
        where: { id: newProject.id },
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
          contacts: {
            orderBy: { createdAt: 'asc' },
          },
          phases: {
            orderBy: { phaseOrder: 'asc' },
          },
        },
      });
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

    // Извличаме контактите от DTO ако има такива
    const { contacts, ...projectData } = updateProjectDto;

    const project = await this.prisma.project.update({
      where: { id },
      data: projectData,
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
        contacts: {
          orderBy: { createdAt: 'asc' },
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

  // Project Contacts methods
  async getProjectContacts(projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const contacts = await this.prisma.projectContact.findMany({
      where: { projectId },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return {
      success: true,
      data: contacts,
    };
  }

  async addProjectContact(projectId: string, contactDto: CreateProjectContactDto) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    // Проверяваме дали вече има 3 контакта (максимум)
    const existingContacts = await this.prisma.projectContact.count({
      where: { projectId },
    });

    if (existingContacts >= 3) {
      throw new BadRequestException('Project can have maximum 3 contacts');
    }

    // Ако се опитва да направи контакт primary, махаме primary от други контакти
    if (contactDto.isPrimary) {
      await this.prisma.projectContact.updateMany({
        where: { projectId },
        data: { isPrimary: false },
      });
    }

    // Ако няма други контакти, този става primary автоматично
    if (existingContacts === 0) {
      contactDto.isPrimary = true;
    }

    const contact = await this.prisma.projectContact.create({
      data: {
        ...contactDto,
        projectId,
      },
    });

    return {
      success: true,
      data: contact,
      message: 'Contact added successfully',
    };
  }

  async updateProjectContact(projectId: string, contactId: string, contactDto: Partial<CreateProjectContactDto>) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const existingContact = await this.prisma.projectContact.findFirst({
      where: { 
        id: contactId,
        projectId,
      },
    });

    if (!existingContact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found in project ${projectId}`);
    }

    // Ако се опитва да направи контакт primary, махаме primary от други контакти
    if (contactDto.isPrimary) {
      await this.prisma.projectContact.updateMany({
        where: { 
          projectId,
          id: { not: contactId },
        },
        data: { isPrimary: false },
      });
    }

    const contact = await this.prisma.projectContact.update({
      where: { id: contactId },
      data: contactDto,
    });

    return {
      success: true,
      data: contact,
      message: 'Contact updated successfully',
    };
  }

  async removeProjectContact(projectId: string, contactId: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const existingContact = await this.prisma.projectContact.findFirst({
      where: { 
        id: contactId,
        projectId,
      },
    });

    if (!existingContact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found in project ${projectId}`);
    }

    // Проверяваме дали има други контакти
    const totalContacts = await this.prisma.projectContact.count({
      where: { projectId },
    });

    if (totalContacts === 1) {
      throw new BadRequestException('Project must have at least one contact');
    }

    // Ако триеме primary контакт, правим друг контакт primary
    if (existingContact.isPrimary) {
      const nextContact = await this.prisma.projectContact.findFirst({
        where: { 
          projectId,
          id: { not: contactId },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (nextContact) {
        await this.prisma.projectContact.update({
          where: { id: nextContact.id },
          data: { isPrimary: true },
        });
      }
    }

    await this.prisma.projectContact.delete({
      where: { id: contactId },
    });

    return {
      success: true,
      message: 'Contact removed successfully',
    };
  }

  async setPrimaryContact(projectId: string, contactId: string) {
    const project = await this.prisma.project.findFirst({
      where: { 
        id: projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    const contact = await this.prisma.projectContact.findFirst({
      where: { 
        id: contactId,
        projectId,
      },
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${contactId} not found in project ${projectId}`);
    }

    // Махаме primary от всички контакти в проекта
    await this.prisma.projectContact.updateMany({
      where: { projectId },
      data: { isPrimary: false },
    });

    // Правим този контакт primary
    const updatedContact = await this.prisma.projectContact.update({
      where: { id: contactId },
      data: { isPrimary: true },
    });

    return {
      success: true,
      data: updatedContact,
      message: 'Primary contact updated successfully',
    };
  }
} 