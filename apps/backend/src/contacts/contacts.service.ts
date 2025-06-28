import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, UpdateContactDto } from './contacts.controller';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    // Ако създаваме основен контакт, първо направим всички други неосновни
    if (createContactDto.isPrimary) {
      if (createContactDto.manufacturerId) {
        await this.prisma.contact.updateMany({
          where: { manufacturerId: createContactDto.manufacturerId },
          data: { isPrimary: false }
        });
      }
      if (createContactDto.supplierId) {
        await this.prisma.contact.updateMany({
          where: { supplierId: createContactDto.supplierId },
          data: { isPrimary: false }
        });
      }
    }

    return this.prisma.contact.create({
      data: createContactDto,
      include: {
        manufacturer: true,
        supplier: true,
      },
    });
  }

  async findAll(filters: { manufacturerId?: string; supplierId?: string }) {
    const where: any = {};
    
    if (filters.manufacturerId) {
      where.manufacturerId = filters.manufacturerId;
    }
    
    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    return this.prisma.contact.findMany({
      where,
      include: {
        manufacturer: true,
        supplier: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { name: 'asc' }
      ],
    });
  }

  async findOne(id: string) {
    return this.prisma.contact.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        supplier: true,
      },
    });
  }

  async update(id: string, updateContactDto: UpdateContactDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new Error('Contact not found');
    }

    // Ако го правим основен контакт, първо направим всички други неосновни
    if (updateContactDto.isPrimary && !contact.isPrimary) {
      if (contact.manufacturerId) {
        await this.prisma.contact.updateMany({
          where: { 
            manufacturerId: contact.manufacturerId,
            id: { not: id }
          },
          data: { isPrimary: false }
        });
      }
      if (contact.supplierId) {
        await this.prisma.contact.updateMany({
          where: { 
            supplierId: contact.supplierId,
            id: { not: id }
          },
          data: { isPrimary: false }
        });
      }
    }

    return this.prisma.contact.update({
      where: { id },
      data: updateContactDto,
      include: {
        manufacturer: true,
        supplier: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.contact.delete({
      where: { id },
    });
  }

  async setPrimary(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) {
      throw new Error('Contact not found');
    }

    // Направи всички други контакти неосновни
    if (contact.manufacturerId) {
      await this.prisma.contact.updateMany({
        where: { 
          manufacturerId: contact.manufacturerId,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
    }
    if (contact.supplierId) {
      await this.prisma.contact.updateMany({
        where: { 
          supplierId: contact.supplierId,
          id: { not: id }
        },
        data: { isPrimary: false }
      });
    }

    // Направи този контакт основен
    return this.prisma.contact.update({
      where: { id },
      data: { isPrimary: true },
      include: {
        manufacturer: true,
        supplier: true,
      },
    });
  }
} 