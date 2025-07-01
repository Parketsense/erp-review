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

@Controller('phases')
export class PhasesController {
  constructor(private readonly phasesService: PhasesService) {}

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
    @Body() reorderData: { phases: { id: string; phaseOrder: number }[] },
  ) {
    return this.phasesService.reorderPhases(projectId, reorderData.phases);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phasesService.remove(id);
  }
} 