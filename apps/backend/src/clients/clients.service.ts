import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, userId: string | null) {
    // Check for existing EIK if provided
    if (createClientDto.eikBulstat && createClientDto.eikBulstat.trim()) {
      const existingClient = await this.prisma.client.findFirst({
        where: { eik: createClientDto.eikBulstat.trim() },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK already exists');
      }
    }

    // Generate name from firstName + lastName
    const name = `${createClientDto.firstName} ${createClientDto.lastName}`.trim();

    const client = await this.prisma.client.create({
      data: {
        name,
        eik: createClientDto.eikBulstat && createClientDto.eikBulstat.trim() ? createClientDto.eikBulstat.trim() : null,
        mol: createClientDto.companyMol && createClientDto.companyMol.trim() ? createClientDto.companyMol.trim() : null,
        address: (createClientDto.address && createClientDto.address.trim()) || (createClientDto.companyAddress && createClientDto.companyAddress.trim()) || null,
        phone: (createClientDto.phone && createClientDto.phone.trim()) || (createClientDto.companyPhone && createClientDto.companyPhone.trim()) || null,
        email: (createClientDto.email && createClientDto.email.trim()) || (createClientDto.companyEmail && createClientDto.companyEmail.trim()) || null,
        contactPerson: createClientDto.hasCompany ? name : null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: client,
      message: 'Client created successfully',
    };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    hasCompany?: boolean;
    isArchitect?: boolean;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (options.search) {
      where.OR = [
        { name: { contains: options.search } },
        { email: { contains: options.search } },
        { phone: { contains: options.search } },
        { eik: { contains: options.search } },
      ];
    }

    // Always show active clients
    where.isActive = true;

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: clients,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    return {
      success: true,
      data: client,
    };
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId?: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check for existing EIK if provided and different from current
    if (updateClientDto.eikBulstat && updateClientDto.eikBulstat !== client.eik) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          eik: updateClientDto.eikBulstat,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK already exists');
      }
    }

    // Generate name if firstName/lastName are provided
    const updateData: any = { updatedById: userId };
    
    if (updateClientDto.firstName || updateClientDto.lastName) {
      const currentFirstName = updateClientDto.firstName || client.name?.split(' ')[0] || '';
      const currentLastName = updateClientDto.lastName || client.name?.split(' ').slice(1).join(' ') || '';
      updateData.name = `${currentFirstName} ${currentLastName}`.trim();
    }

    if (updateClientDto.eikBulstat !== undefined) updateData.eik = updateClientDto.eikBulstat;
    if (updateClientDto.companyMol !== undefined) updateData.mol = updateClientDto.companyMol;
    if (updateClientDto.address !== undefined) updateData.address = updateClientDto.address;
    if (updateClientDto.phone !== undefined) updateData.phone = updateClientDto.phone;
    if (updateClientDto.email !== undefined) updateData.email = updateClientDto.email;

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedClient,
      message: 'Client updated successfully',
    };
  }

  async remove(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    await this.prisma.client.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Client deleted successfully',
    };
  }

  async checkEik(eik: string) {
    const existingClient = await this.prisma.client.findFirst({
      where: { eik },
    });

    return {
      success: true,
      data: {
        exists: !!existingClient,
        name: existingClient?.name || null,
      },
    };
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.client.count({ where: { isActive: true } }),
      this.prisma.client.count({ where: { isActive: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        active,
      },
    };
  }
}

