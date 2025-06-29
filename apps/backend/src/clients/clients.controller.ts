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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createClientDto: CreateClientDto) {
    // Using null for now since we don't have auth
    return this.clientsService.create(createClientDto, null);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('hasCompany') hasCompany?: string,
    @Query('isArchitect') isArchitect?: string,
  ) {
    return this.clientsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      hasCompany: hasCompany === 'true' ? true : hasCompany === 'false' ? false : undefined,
      isArchitect: isArchitect === 'true' ? true : isArchitect === 'false' ? false : undefined,
    });
  }

  @Get('stats')
  getStats() {
    return this.clientsService.getStats();
  }

  @Get('check-eik/:eik')
  checkEik(@Param('eik') eik: string) {
    return this.clientsService.checkEik(eik);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.clientsService.toggleActive(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
