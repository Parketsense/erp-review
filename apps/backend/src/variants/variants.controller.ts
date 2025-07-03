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
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { 
      name?: string;
      targetPhaseId?: string;
      cloneType?: 'all' | 'selected';
      selectedRoomIds?: string[];
      includeProducts?: boolean;
    },
  ) {
    try {
      const duplicatedVariant = await this.variantsService.duplicateVariant(id, body);
      return {
        success: true,
        data: duplicatedVariant,
        message: 'Variant duplicated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }

  @Post(':id/update-discounts')
  @HttpCode(HttpStatus.OK)
  async updateDiscounts(@Param('id', ParseUUIDPipe) id: string) {
    try {
      // This endpoint will manually trigger discount update for testing
      const result = await this.variantsService.updateRoomDiscountsManually(id);
      return {
        success: true,
        data: result,
        message: 'Discounts updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/select')
  @HttpCode(HttpStatus.OK)
  async selectVariant(@Param('id', ParseUUIDPipe) id: string) {
    return this.variantsService.selectVariant(id);
  }
} 