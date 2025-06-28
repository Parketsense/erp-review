import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, userId: string) {
    // Check for duplicate EIK if it's a company
    if (createClientDto.hasCompany && createClientDto.eikBulstat) {
      const existingClient = await this.prisma.client.findFirst({
        where: { eikBulstat: createClientDto.eikBulstat },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK/BULSTAT already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        ...createClientDto,
        createdBy: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return client;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }) {
    const { page = 1, limit = 10, search, type } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { eikBulstat: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.hasCompany = type === 'COMPANY';
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        projects: {
          include: {
            phases: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  async getClientProjects(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const projects = await this.prisma.project.findMany({
      where: { clientId },
      include: {
        phases: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check for duplicate EIK if updating to company or changing EIK
    if (updateClientDto.eikBulstat && updateClientDto.eikBulstat !== client.eikBulstat) {
      const existingClient = await this.prisma.client.findFirst({
        where: { eikBulstat: updateClientDto.eikBulstat },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK/BULSTAT already exists');
      }
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateClientDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        projects: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
          },
        },
      },
    });

    return updatedClient;
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if client has active projects
    const activeProjects = await this.prisma.project.findMany({
      where: {
        clientId: id,
        status: { not: 'CANCELLED' },
      },
    });

    if (activeProjects.length > 0) {
      throw new ConflictException('Cannot delete client with active projects');
    }

    // Soft delete
    await this.prisma.client.update({
      where: { id },
      data: { 
        isActive: false 
      },
    });

    return { message: 'Client deleted successfully' };
  }

  async checkEik(eikBulstat: string) {
    const existingClient = await this.prisma.client.findFirst({
      where: { eikBulstat },
      select: {
        id: true,
        companyName: true,
        firstName: true,
        lastName: true,
      },
    });

    return {
      exists: !!existingClient,
      client: existingClient,
    };
  }
} 