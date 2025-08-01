import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PhasesService } from './phases.service';
import { CreatePhaseDto } from './dto/create-phase.dto';
import { UpdatePhaseDto } from './dto/update-phase.dto';
import { OffersService } from '../offers/offers.service';
import { VariantsService } from '../variants/variants.service';

@Controller('phases')
export class PhasesController {
  constructor(
    private readonly phasesService: PhasesService,
    private readonly offersService: OffersService,
    private readonly variantsService: VariantsService,
  ) {}

  @Post('project/:projectId')
  create(
    @Param('projectId') projectId: string,
    @Body() createPhaseDto: CreatePhaseDto,
  ) {
    return this.phasesService.create(projectId, createPhaseDto);
  }

  @Get()
  findAll() {
    return this.phasesService.findAll();
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.phasesService.findByProject(projectId);
  }

  @Get('stats')
  getStats() {
    return this.phasesService.getStats();
  }

  @Get(':phaseId/variants/offer')
  async getVariantsForOffer(@Param('phaseId') phaseId: string) {
    return this.variantsService.getVariantsForOffer(phaseId);
  }

  @Get(':phaseId/offers')
  async getOffers(@Param('phaseId') phaseId: string) {
    return this.offersService.getOffersForPhase(phaseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phasesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePhaseDto: UpdatePhaseDto) {
    return this.phasesService.update(id, updatePhaseDto);
  }

  @Put('project/:projectId/reorder')
  reorderPhases(
    @Param('projectId') projectId: string,
    @Body() reorderData: { phases: { phaseId: string; newOrder: number }[] },
  ) {
    return this.phasesService.reorderPhases(projectId, reorderData.phases);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phasesService.remove(id);
  }
} 