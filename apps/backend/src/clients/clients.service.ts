import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto, userId: string | null) {
    // Check for existing EIK if provided
    if (createClientDto.hasCompany && createClientDto.eikBulstat && createClientDto.eikBulstat.trim()) {
      const existingClient = await this.prisma.client.findFirst({
        where: { eikBulstat: createClientDto.eikBulstat.trim() },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK already exists');
      }
    }

    const client = await this.prisma.client.create({
      data: {
        firstName: createClientDto.firstName,
        lastName: createClientDto.lastName,
        phone: createClientDto.phone || null,
        email: createClientDto.email || null,
        address: createClientDto.address || null,
        hasCompany: createClientDto.hasCompany || false,
        companyName: createClientDto.hasCompany ? createClientDto.companyName || null : null,
        eikBulstat: createClientDto.hasCompany ? createClientDto.eikBulstat || null : null,
        vatNumber: createClientDto.hasCompany ? createClientDto.vatNumber || null : null,
        companyAddress: createClientDto.hasCompany ? createClientDto.companyAddress || null : null,
        companyPhone: createClientDto.hasCompany ? createClientDto.companyPhone || null : null,
        companyEmail: createClientDto.hasCompany ? createClientDto.companyEmail || null : null,
        companyMol: createClientDto.hasCompany ? createClientDto.companyMol || null : null,
        isArchitect: createClientDto.isArchitect || false,
        commissionPercent: createClientDto.isArchitect ? createClientDto.commissionPercent || null : null,
        notes: createClientDto.notes || null,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
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
    includeInactive?: boolean;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50; // Увеличаваме лимита за по-добро потребителско изживяване
    const skip = (page - 1) * limit;
    const where: any = {};

    if (options.search) {
      where.OR = [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
        { phone: { contains: options.search, mode: 'insensitive' } },
        { companyName: { contains: options.search, mode: 'insensitive' } },
        { eikBulstat: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options.hasCompany !== undefined) {
      where.hasCompany = options.hasCompany;
    }

    if (options.isArchitect !== undefined) {
      where.isArchitect = options.isArchitect;
    }

    // Include inactive clients only if explicitly requested
    if (!options.includeInactive) {
      where.isActive = true;
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
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
            id: true,
            name: true,
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
    if (updateClientDto.hasCompany && updateClientDto.eikBulstat && updateClientDto.eikBulstat !== client.eikBulstat) {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          eikBulstat: updateClientDto.eikBulstat,
          id: { not: id },
        },
      });

      if (existingClient) {
        throw new ConflictException('Client with this EIK already exists');
      }
    }

    const updateData: any = { updatedById: userId };
    
    // Update personal information
    if (updateClientDto.firstName !== undefined) updateData.firstName = updateClientDto.firstName;
    if (updateClientDto.lastName !== undefined) updateData.lastName = updateClientDto.lastName;
    if (updateClientDto.phone !== undefined) updateData.phone = updateClientDto.phone;
    if (updateClientDto.email !== undefined) updateData.email = updateClientDto.email;
    if (updateClientDto.address !== undefined) updateData.address = updateClientDto.address;

    // Update company information
    if (updateClientDto.hasCompany !== undefined) {
      updateData.hasCompany = updateClientDto.hasCompany;
      
      if (updateClientDto.hasCompany) {
        if (updateClientDto.companyName !== undefined) updateData.companyName = updateClientDto.companyName;
        if (updateClientDto.eikBulstat !== undefined) updateData.eikBulstat = updateClientDto.eikBulstat;
        if (updateClientDto.vatNumber !== undefined) updateData.vatNumber = updateClientDto.vatNumber;
        if (updateClientDto.companyAddress !== undefined) updateData.companyAddress = updateClientDto.companyAddress;
        if (updateClientDto.companyPhone !== undefined) updateData.companyPhone = updateClientDto.companyPhone;
        if (updateClientDto.companyEmail !== undefined) updateData.companyEmail = updateClientDto.companyEmail;
        if (updateClientDto.companyMol !== undefined) updateData.companyMol = updateClientDto.companyMol;
      } else {
        // Clear company fields if hasCompany is false
        updateData.companyName = null;
        updateData.eikBulstat = null;
        updateData.vatNumber = null;
        updateData.companyAddress = null;
        updateData.companyPhone = null;
        updateData.companyEmail = null;
        updateData.companyMol = null;
      }
    }

    // Update architect information
    if (updateClientDto.isArchitect !== undefined) {
      updateData.isArchitect = updateClientDto.isArchitect;
      
      if (updateClientDto.isArchitect) {
        if (updateClientDto.commissionPercent !== undefined) updateData.commissionPercent = updateClientDto.commissionPercent;
      } else {
        updateData.commissionPercent = null;
      }
    }

    // Update notes
    if (updateClientDto.notes !== undefined) updateData.notes = updateClientDto.notes;

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
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
      where: { eikBulstat: eik },
    });

    return {
      success: true,
      data: {
        exists: !!existingClient,
        name: existingClient ? `${existingClient.firstName} ${existingClient.lastName}` : null,
        companyName: existingClient?.companyName || null,
      },
    };
  }

  async getStats() {
    const [total, companies, individuals, architects] = await Promise.all([
      this.prisma.client.count({ where: { isActive: true } }),
      this.prisma.client.count({ where: { isActive: true, hasCompany: true } }),
      this.prisma.client.count({ where: { isActive: true, hasCompany: false } }),
      this.prisma.client.count({ where: { isActive: true, isArchitect: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        companies,
        individuals,
        architects,
      },
    };
  }

  async toggleActive(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    const updatedClient = await this.prisma.client.update({
      where: { id },
      data: {
        isActive: !client.isActive,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedClient,
      message: `Client ${updatedClient.isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }
}

