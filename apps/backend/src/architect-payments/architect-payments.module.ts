import { Module } from '@nestjs/common';
import { ArchitectPaymentsService } from './architect-payments.service';
import { ArchitectPaymentsController } from './architect-payments.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArchitectPaymentsController],
  providers: [ArchitectPaymentsService],
  exports: [ArchitectPaymentsService]
})
export class ArchitectPaymentsModule {} 