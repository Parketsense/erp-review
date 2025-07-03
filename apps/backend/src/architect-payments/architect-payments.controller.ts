import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ArchitectPaymentsService } from './architect-payments.service';
import { CreateArchitectPaymentDto } from './dto/create-architect-payment.dto';
import { UpdateArchitectPaymentDto } from './dto/update-architect-payment.dto';

@Controller('architect-payments')
export class ArchitectPaymentsController {
  constructor(private readonly architectPaymentsService: ArchitectPaymentsService) {}

  @Post()
  create(@Body() createArchitectPaymentDto: CreateArchitectPaymentDto) {
    return this.architectPaymentsService.create(createArchitectPaymentDto);
  }

  @Get()
  findAll() {
    return this.architectPaymentsService.findAll();
  }

  @Get('phase/:phaseId')
  findByPhase(@Param('phaseId') phaseId: string) {
    return this.architectPaymentsService.findByPhase(phaseId);
  }

  @Get('phase/:phaseId/stats')
  getPhaseCommissionStats(@Param('phaseId') phaseId: string) {
    return this.architectPaymentsService.getPhaseCommissionStats(phaseId);
  }

  @Get('project/:projectId/stats')
  getProjectCommissionStats(@Param('projectId') projectId: string) {
    return this.architectPaymentsService.getProjectCommissionStats(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.architectPaymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArchitectPaymentDto: UpdateArchitectPaymentDto) {
    return this.architectPaymentsService.update(id, updateArchitectPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.architectPaymentsService.remove(id);
  }
} 