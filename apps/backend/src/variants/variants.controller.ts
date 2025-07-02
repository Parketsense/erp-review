import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  create(@Body() createVariantDto: CreateVariantDto) {
    return this.variantsService.create(createVariantDto);
  }

  @Get()
  findAll() {
    return this.variantsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.variantsService.getStats();
  }

  @Get('phase/:phaseId')
  findByPhase(@Param('phaseId') phaseId: string) {
    return this.variantsService.findByPhase(phaseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVariantDto: UpdateVariantDto) {
    return this.variantsService.update(id, updateVariantDto);
  }

  @Put('phase/:phaseId/reorder')
  reorderVariants(
    @Param('phaseId') phaseId: string,
    @Body() body: { variantIds: string[] }
  ) {
    return this.variantsService.reorderVariants(phaseId, body.variantIds);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
} 