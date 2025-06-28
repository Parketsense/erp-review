import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    const { contacts, ...projectData } = createProjectDto;
    
    return this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        type: createProjectDto.projectType || 'APARTMENT',
        address: createProjectDto.address,
        description: createProjectDto.description,
        clientId: createProjectDto.clientId,
        createdBy: createProjectDto.createdBy || 'system',
        contacts: {
          create: contacts || []
        }
      },
      include: {
        client: true,
        contacts: true,
        phases: true
      }
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        client: true,
        contacts: true,
        phases: {
          include: {
            variants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        contacts: true,
        phases: {
          include: {
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
        }
      }
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const { contacts, ...projectData } = updateProjectDto;
    
    // Check if project exists
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        ...(contacts && {
          contacts: {
            deleteMany: {},
            create: contacts
          }
        })
      },
      include: {
        client: true,
        contacts: true,
        phases: true
      }
    });
  }

  async remove(id: string) {
    // Check if project exists
    await this.findOne(id);

    return this.prisma.project.delete({
      where: { id }
    });
  }

  async findByClient(clientId: string) {
    return this.prisma.project.findMany({
      where: { clientId },
      include: {
        client: true,
        contacts: true,
        phases: {
          include: {
            variants: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
} 