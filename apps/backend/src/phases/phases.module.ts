import { Module } from '@nestjs/common';
import { PhasesController } from './phases.controller';
import { PhasesService } from './phases.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OffersService } from '../offers/offers.service';
import { OffersModule } from '../offers/offers.module';
import { VariantsModule } from '../variants/variants.module';

@Module({
  imports: [PrismaModule, OffersModule, VariantsModule],
  controllers: [PhasesController],
  providers: [PhasesService, OffersService],
  exports: [PhasesService],
})
export class PhasesModule {} 