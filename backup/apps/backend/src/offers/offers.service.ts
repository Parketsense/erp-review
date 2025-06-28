import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOfferDto, OfferType, OfferStatus } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferDto: CreateOfferDto) {
    const { items, ...offerData } = createOfferDto;
    
    return this.prisma.offer.create({
      data: {
        ...offerData,
        status: OfferStatus.DRAFT,
        items: {
          create: items.map(item => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            description: item.description,
            unit: item.unit,
            category: item.category,
          }))
        }
      },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      }
    });
  }

  async findAll() {
    return this.prisma.offer.findMany({
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async findByProject(projectId: string) {
    return this.prisma.offer.findMany({
      where: { projectId },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByVariant(variantId: string) {
    return this.prisma.offer.findMany({
      where: { variantId },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByType(type: OfferType) {
    return this.prisma.offer.findMany({
      where: { type },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: string, updateOfferDto: UpdateOfferDto) {
    const { items, ...updateData } = updateOfferDto;

    // If items are being updated, replace all existing items
    if (items) {
      await this.prisma.offerItem.deleteMany({
        where: { offerId: id },
      });
    }

    return this.prisma.offer.update({
      where: { id },
      data: {
        ...updateData,
        ...(items && {
          items: {
            create: items.map(item => ({
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              description: item.description,
              unit: item.unit,
              category: item.category,
            }))
          }
        }),
      },
      include: {
        items: true,
        project: true,
        variant: true,
        room: true,
        client: true,
      },
    });
  }

  async remove(id: string) {
    // Delete related items first
    await this.prisma.offerItem.deleteMany({
      where: { offerId: id },
    });

    return this.prisma.offer.delete({
      where: { id },
    });
  }

  async generateOfferNumber(type: OfferType): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = this.getTypePrefix(type);
    
    // Get the last offer number for this type and year
    const lastOffer = await this.prisma.offer.findFirst({
      where: {
        offerNumber: {
          startsWith: `${prefix}${year}-`,
        },
      },
      orderBy: {
        offerNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastOffer) {
      const lastSequence = parseInt(lastOffer.offerNumber.split('-')[1]);
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}-${sequence.toString().padStart(6, '0')}`;
  }

  private getTypePrefix(type: OfferType): string {
    switch (type) {
      case OfferType.MATERIALS:
        return 'OF';
      case OfferType.INSTALLATION:
        return 'IN';
      case OfferType.COMPLETE:
        return 'CP';
      case OfferType.LUXURY:
        return 'LX';
      case OfferType.CUSTOM:
        return 'CU';
      default:
        return 'OF';
    }
  }

  async getOfferStats() {
    const [totalOffers, draftOffers, sentOffers, acceptedOffers, totalAmount] = await Promise.all([
      this.prisma.offer.count(),
      this.prisma.offer.count({ where: { status: OfferStatus.DRAFT } }),
      this.prisma.offer.count({ where: { status: OfferStatus.SENT } }),
      this.prisma.offer.count({ where: { status: OfferStatus.ACCEPTED } }),
      this.prisma.offer.aggregate({
        _sum: { totalAmount: true },
        where: { status: OfferStatus.ACCEPTED },
      }),
    ]);

    return {
      totalOffers,
      draftOffers,
      sentOffers,
      acceptedOffers,
      totalAmount: totalAmount._sum.totalAmount || 0,
    };
  }
} 