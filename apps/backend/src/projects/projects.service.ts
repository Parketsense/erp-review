import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    // For now, return a mock response since we don't have Project table yet
    const project = {
      id: `proj_${Date.now()}`,
      ...createProjectDto,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

    // Mock data for now - specify type explicitly
    const projects: any[] = [];

    return {
      success: true,
      data: projects,
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  async findOne(id: string) {
    // Mock data for now
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    // Mock data for now
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  async remove(id: string) {
    // Mock data for now
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  async toggleActive(id: string) {
    // Mock data for now
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  async getStats() {
    return {
      success: true,
      data: {
        total: 0,
        active: 0,
        byType: {
          apartment: 0,
          house: 0,
          office: 0,
          commercial: 0,
          other: 0,
        },
      },
    };
  }
} 