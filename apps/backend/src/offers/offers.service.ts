import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferDto: CreateOfferDto, userId: string | null) {
    // Check for existing offer number if provided
    if (createOfferDto.offerNumber && createOfferDto.offerNumber.trim()) {
      const existingOffer = await this.prisma.offer.findFirst({
        where: { offerNumber: createOfferDto.offerNumber.trim() },
      });

      if (existingOffer) {
        throw new ConflictException('Offer with this number already exists');
      }
    }

    const offer = await this.prisma.offer.create({
      data: {
        projectId: createOfferDto.projectId,
        phaseId: createOfferDto.phaseId || null,
        clientId: createOfferDto.clientId,
        offerNumber: createOfferDto.offerNumber,
        projectName: createOfferDto.projectName || null,
        subject: createOfferDto.subject || null,
        validUntil: createOfferDto.validUntil ? this.formatDate(createOfferDto.validUntil) : null,
        expiresAt: createOfferDto.expiresAt ? this.formatDate(createOfferDto.expiresAt) : null,
        conditions: createOfferDto.conditions || null,
        emailSubject: createOfferDto.emailSubject || null,
        emailBody: createOfferDto.emailBody || null,
        status: createOfferDto.status || 'draft',
        sentCount: createOfferDto.sentCount || 0,
        lastSentAt: createOfferDto.lastSentAt ? this.formatDate(createOfferDto.lastSentAt) : null,
        lastSentTo: createOfferDto.lastSentTo || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: offer,
      message: 'Offer created successfully',
    };
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    projectId?: string;
    clientId?: string;
    includeInactive?: boolean;
  } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;
    const where: any = {};

    if (options.search) {
      const searchTerms = options.search.trim().split(/\s+/);
      
      if (searchTerms.length === 1) {
        const term = searchTerms[0];
        const lowerTerm = term.toLowerCase();
        const upperTerm = term.toUpperCase();
        const capitalTerm = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
        
        where.OR = [
          { offerNumber: { contains: term } },
          { offerNumber: { contains: lowerTerm } },
          { offerNumber: { contains: upperTerm } },
          { offerNumber: { contains: capitalTerm } },
          { projectName: { contains: term } },
          { projectName: { contains: lowerTerm } },
          { projectName: { contains: upperTerm } },
          { projectName: { contains: capitalTerm } },
          { subject: { contains: term } },
          { subject: { contains: lowerTerm } },
          { subject: { contains: upperTerm } },
          { subject: { contains: capitalTerm } },
        ];
      } else {
        where.AND = searchTerms.map(term => {
          const lowerTerm = term.toLowerCase();
          const upperTerm = term.toUpperCase();
          const capitalTerm = term.charAt(0).toUpperCase() + term.slice(1).toLowerCase();
          
          return {
            OR: [
              { offerNumber: { contains: term } },
              { offerNumber: { contains: lowerTerm } },
              { offerNumber: { contains: upperTerm } },
              { offerNumber: { contains: capitalTerm } },
              { projectName: { contains: term } },
              { projectName: { contains: lowerTerm } },
              { projectName: { contains: upperTerm } },
              { projectName: { contains: capitalTerm } },
              { subject: { contains: term } },
              { subject: { contains: lowerTerm } },
              { subject: { contains: upperTerm } },
              { subject: { contains: capitalTerm } },
            ]
          };
        });
      }
    }

    if (options.status) {
      where.status = options.status;
    }

    if (options.projectId) {
      where.projectId = options.projectId;
    }

    if (options.clientId) {
      where.clientId = options.clientId;
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          phase: {
            select: {
              id: true,
              name: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              companyName: true,
            },
          },
        },
      }),
      this.prisma.offer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: offers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
        variants: {
          include: {
            rooms: {
              include: {
                products: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        nameBg: true,
                        code: true,
                      },
                    },
                  },
                },
                installations: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return {
      success: true,
      data: offer,
    };
  }

  async update(id: string, updateOfferDto: UpdateOfferDto, userId?: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Check for existing offer number if provided and different from current
    if (updateOfferDto.offerNumber && updateOfferDto.offerNumber !== offer.offerNumber) {
      const existingOffer = await this.prisma.offer.findFirst({
        where: {
          offerNumber: updateOfferDto.offerNumber,
          id: { not: id },
        },
      });

      if (existingOffer) {
        throw new ConflictException('Offer with this number already exists');
      }
    }

    const updateData: any = {};
    
    // Update offer information
    if (updateOfferDto.projectId !== undefined) updateData.projectId = updateOfferDto.projectId;
    if (updateOfferDto.phaseId !== undefined) updateData.phaseId = updateOfferDto.phaseId;
    if (updateOfferDto.clientId !== undefined) updateData.clientId = updateOfferDto.clientId;
    if (updateOfferDto.offerNumber !== undefined) updateData.offerNumber = updateOfferDto.offerNumber;
    if (updateOfferDto.projectName !== undefined) updateData.projectName = updateOfferDto.projectName;
    if (updateOfferDto.subject !== undefined) updateData.subject = updateOfferDto.subject;
    if (updateOfferDto.validUntil !== undefined) updateData.validUntil = updateOfferDto.validUntil;
    if (updateOfferDto.expiresAt !== undefined) updateData.expiresAt = updateOfferDto.expiresAt;
    if (updateOfferDto.conditions !== undefined) updateData.conditions = updateOfferDto.conditions;
    if (updateOfferDto.emailSubject !== undefined) updateData.emailSubject = updateOfferDto.emailSubject;
    if (updateOfferDto.emailBody !== undefined) updateData.emailBody = updateOfferDto.emailBody;
    if (updateOfferDto.status !== undefined) updateData.status = updateOfferDto.status;
    if (updateOfferDto.sentCount !== undefined) updateData.sentCount = updateOfferDto.sentCount;
    if (updateOfferDto.lastSentAt !== undefined) updateData.lastSentAt = updateOfferDto.lastSentAt;
    if (updateOfferDto.lastSentTo !== undefined) updateData.lastSentTo = updateOfferDto.lastSentTo;

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedOffer,
      message: 'Offer updated successfully',
    };
  }

  async remove(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    await this.prisma.offer.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Offer deleted successfully',
    };
  }

  async checkOfferNumber(offerNumber: string) {
    const existingOffer = await this.prisma.offer.findFirst({
      where: { offerNumber: offerNumber },
    });

    return {
      success: true,
      data: {
        exists: !!existingOffer,
        projectName: existingOffer?.projectName || null,
        status: existingOffer?.status || null,
      },
    };
  }

  async getStats() {
    const [total, drafts, sent, viewed, accepted, rejected] = await Promise.all([
      this.prisma.offer.count(),
      this.prisma.offer.count({ where: { status: 'draft' } }),
      this.prisma.offer.count({ where: { status: 'sent' } }),
      this.prisma.offer.count({ where: { status: 'viewed' } }),
      this.prisma.offer.count({ where: { status: 'accepted' } }),
      this.prisma.offer.count({ where: { status: 'rejected' } }),
    ]);

    const active = drafts + sent + viewed;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const viewRate = total > 0 ? Math.round(((viewed + accepted) / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        active,
        draft: drafts,
        sent,
        viewed,
        accepted,
        rejected,
        acceptanceRate,
        viewRate,
        thisMonth: 0, // TODO: Implement monthly stats
        monthlyGrowth: 0, // TODO: Implement growth calculation
      },
    };
  }

  async toggleActive(id: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // For offers, we might want to toggle between draft and sent status
    const newStatus = offer.status === 'draft' ? 'sent' : 'draft';

    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedOffer,
      message: `Offer status changed to ${newStatus} successfully`,
    };
  }

  private formatDate(dateString: string): string | null {
    // Handle different date formats and convert to ISO-8601
    if (!dateString || dateString.trim() === '') return null;
    
    try {
      // If it's already in ISO format, return as is
      if (dateString.includes('T') || dateString.includes('Z')) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      }
      
      // If it's just a date (YYYY-MM-DD), add time to make it ISO
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString + 'T00:00:00.000Z');
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      }
      
      // For other formats, try to parse and convert
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch (error) {
      console.warn('Invalid date format:', dateString, error);
      return null;
    }
  }

  async getOffersForPhase(phaseId: string) {
    return this.prisma.offer.findMany({ where: { phaseId } });
  }

  async getPreview(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        phase: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            companyName: true,
          },
        },
        variants: {
          include: {
            rooms: {
              include: {
                products: {
                  include: {
                    product: {
                      select: {
                        id: true,
                        nameBg: true,
                        code: true,
                      },
                    },
                  },
                },
                installations: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    // Calculate total values
    let totalValue = 0;
    const variants = offer.variants?.map(variant => {
      let variantTotal = 0;
      const rooms = variant.rooms?.map(room => {
        let roomTotal = 0;
        const products = room.products?.map(product => {
          const productTotal = product.quantity * product.unitPrice * (1 - (product.discount || 0) / 100);
          roomTotal += productTotal;
          return {
            id: product.id,
            name: product.product?.nameBg || 'Unknown Product',
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            discount: product.discount || 0,
            totalPrice: Math.round(productTotal * 100) / 100,
          };
        }) || [];

        return {
          id: room.id,
          name: room.name,
          products,
          totalPrice: Math.round(roomTotal * 100) / 100,
        };
      }) || [];

      variantTotal = rooms.reduce((sum, room) => sum + room.totalPrice, 0);
      totalValue += variantTotal;

      return {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        rooms,
        totalPrice: Math.round(variantTotal * 100) / 100,
      };
    }) || [];

    // Parse terms from conditions JSON
    let terms: string[] = [];
    let parsedTerms: any = null;
    try {
      if (offer.conditions) {
        parsedTerms = JSON.parse(offer.conditions as string);
        if (parsedTerms && parsedTerms.selectedVariants) {
          // Extract terms from parsed data
          terms = [
            'Валидна до датата на офертата',
            'Цените включват ДДС',
            'Доставката се извършва в рамките на 30 дни',
            'Плащането се извършва по следния начин: 50% при поръчка, 50% при доставка'
          ];
        }
      }
    } catch (error) {
      console.warn('Error parsing offer conditions:', error);
    }

    // Use parsed variants if available, otherwise use database variants
    let finalVariants = variants;
    let finalTotalValue = totalValue;

    if (parsedTerms && parsedTerms.selectedVariants) {
      finalVariants = parsedTerms.selectedVariants.map((variant: any) => ({
        id: variant.variantId,
        name: variant.variantName,
        description: variant.description || '',
        totalPrice: variant.totalPrice || 0,
        rooms: variant.rooms?.map((room: any) => ({
          id: room.roomId,
          name: room.roomName,
          totalPrice: room.totalPrice || 0,
          products: room.products?.map((product: any) => ({
            id: product.productId,
            name: product.productName,
            quantity: product.quantity || 0,
            unitPrice: product.unitPrice || 0,
            discount: product.discountPercent || 0,
            totalPrice: product.totalPrice || 0,
          })) || [],
        })) || [],
      })) || [];
      
      finalTotalValue = parsedTerms.totalValue || 0;
    }

    // Prepare preview data
    const previewData = {
      id: offer.id,
      offerNumber: offer.offerNumber,
      subject: offer.subject || `Оферта за ${offer.project?.name}`,
      projectName: offer.project?.name || '',
      clientName: offer.client ? `${offer.client.firstName || ''} ${offer.client.lastName || ''}`.trim() : '',
      clientEmail: offer.client?.email || '',
      validUntil: offer.validUntil,
      createdAt: offer.createdAt.toISOString(),
      status: offer.status,
      totalValue: Math.round(finalTotalValue * 100) / 100,
      variants: finalVariants,
      installationPhase: offer.phase ? {
        id: offer.phase.id,
        name: offer.phase.name,
        description: offer.phase.description,
      } : undefined,
      terms,
      emailTemplate: offer.emailBody || '',
    };

    return {
      success: true,
      data: previewData,
    };
  }
} 