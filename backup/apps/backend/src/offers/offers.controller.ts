import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto, OfferType } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(createOfferDto);
  }

  @Get()
  findAll(@Query('type') type?: OfferType, @Query('projectId') projectId?: string, @Query('variantId') variantId?: string) {
    if (type) {
      return this.offersService.findByType(type);
    }
    if (projectId) {
      return this.offersService.findByProject(projectId);
    }
    if (variantId) {
      return this.offersService.findByVariant(variantId);
    }
    return this.offersService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.offersService.getOfferStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }

  @Post('generate-number')
  generateOfferNumber(@Body() { type }: { type: OfferType }) {
    return this.offersService.generateOfferNumber(type);
  }
} 