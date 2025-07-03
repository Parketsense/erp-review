import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArchitectPaymentDto } from './dto/create-architect-payment.dto';
import { UpdateArchitectPaymentDto } from './dto/update-architect-payment.dto';

@Injectable()
export class ArchitectPaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createArchitectPaymentDto: CreateArchitectPaymentDto) {
    // Verify that the phase exists
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: createArchitectPaymentDto.phaseId },
      include: { project: true }
    });

    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    // Check if phase has architect commission enabled
    if (!phase.includeArchitectCommission) {
      throw new BadRequestException('Architect commission is not enabled for this phase');
    }

    return this.prisma.architectPayment.create({
      data: {
        ...createArchitectPaymentDto,
        paymentDate: new Date(createArchitectPaymentDto.paymentDate),
      },
      include: {
        phase: {
          include: {
            project: true
          }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.architectPayment.findMany({
      include: {
        phase: {
          include: {
            project: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
  }

  async findByPhase(phaseId: string) {
    return this.prisma.architectPayment.findMany({
      where: { phaseId },
      include: {
        phase: {
          include: {
            project: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.architectPayment.findUnique({
      where: { id },
      include: {
        phase: {
          include: {
            project: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundException('Architect payment not found');
    }

    return payment;
  }

  async update(id: string, updateArchitectPaymentDto: UpdateArchitectPaymentDto) {
    // Check if payment exists
    await this.findOne(id);

    const updateData: any = { ...updateArchitectPaymentDto };
    
    // Convert paymentDate string to Date if provided
    if (updateArchitectPaymentDto.paymentDate) {
      updateData.paymentDate = new Date(updateArchitectPaymentDto.paymentDate);
    }

    return this.prisma.architectPayment.update({
      where: { id },
      data: updateData,
      include: {
        phase: {
          include: {
            project: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    // Check if payment exists
    await this.findOne(id);

    return this.prisma.architectPayment.delete({
      where: { id }
    });
  }

  // Calculate commission statistics for a phase
  async getPhaseCommissionStats(phaseId: string) {
    const phase = await this.prisma.projectPhase.findUnique({
      where: { id: phaseId },
      include: {
        payments: true,
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
    });

    if (!phase) {
      throw new NotFoundException('Phase not found');
    }

    // Calculate total phase value (sum of all room products)
    let totalPhaseValue = 0;
    for (const variant of phase.variants) {
      for (const room of variant.rooms) {
        for (const product of room.products) {
          totalPhaseValue += product.quantity * product.unitPrice;
        }
      }
    }

    // Calculate commission based on settings
    let expectedCommission = 0;
    if (phase.architectCommissionPercent && phase.architectCommissionPercent > 0) {
      expectedCommission = totalPhaseValue * (phase.architectCommissionPercent / 100);
    } else if (phase.architectCommissionAmount) {
      expectedCommission = phase.architectCommissionAmount;
    }

    // Calculate paid amount
    const paidAmount = phase.payments
      .filter(payment => payment.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate pending amount
    const pendingAmount = phase.payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);

    const remainingAmount = expectedCommission - paidAmount;

    return {
      phaseId,
      phaseName: phase.name,
      totalPhaseValue,
      expectedCommission,
      paidAmount,
      pendingAmount,
      remainingAmount,
      commissionPercent: phase.architectCommissionPercent,
      commissionAmount: phase.architectCommissionAmount,
      paymentCount: phase.payments.length,
      completedPaymentCount: phase.payments.filter(p => p.status === 'completed').length,
      pendingPaymentCount: phase.payments.filter(p => p.status === 'pending').length
    };
  }

  // Get commission statistics for all phases of a project
  async getProjectCommissionStats(projectId: string) {
    const phases = await this.prisma.projectPhase.findMany({
      where: { projectId },
      include: {
        payments: true,
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
    });

    const stats = await Promise.all(
      phases.map(phase => this.getPhaseCommissionStats(phase.id))
    );

    const totalExpectedCommission = stats.reduce((sum, stat) => sum + stat.expectedCommission, 0);
    const totalPaidAmount = stats.reduce((sum, stat) => sum + stat.paidAmount, 0);
    const totalPendingAmount = stats.reduce((sum, stat) => sum + stat.pendingAmount, 0);
    const totalRemainingAmount = stats.reduce((sum, stat) => sum + stat.remainingAmount, 0);

    return {
      projectId,
      phases: stats,
      totalExpectedCommission,
      totalPaidAmount,
      totalPendingAmount,
      totalRemainingAmount,
      totalPaymentCount: stats.reduce((sum, stat) => sum + stat.paymentCount, 0),
      totalCompletedPaymentCount: stats.reduce((sum, stat) => sum + stat.completedPaymentCount, 0),
      totalPendingPaymentCount: stats.reduce((sum, stat) => sum + stat.pendingPaymentCount, 0)
    };
  }
} 