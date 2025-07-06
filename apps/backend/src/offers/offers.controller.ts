import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOfferDto: CreateOfferDto) {
    // Using null for now since we don't have auth
    return this.offersService.create(createOfferDto, null);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('clientId') clientId?: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.offersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      projectId,
      clientId,
      includeInactive: includeInactive === 'true',
    });
  }

  @Get('stats')
  getStats() {
    return this.offersService.getStats();
  }

  @Get('check-offer-number/:offerNumber')
  checkOfferNumber(@Param('offerNumber') offerNumber: string) {
    return this.offersService.checkOfferNumber(offerNumber);
  }

  @Get(':id/preview')
  getPreview(@Param('id') id: string) {
    return this.offersService.getPreview(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, updateOfferDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.offersService.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offersService.remove(id);
  }
} 