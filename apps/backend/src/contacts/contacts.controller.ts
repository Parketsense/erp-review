import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ContactsService } from './contacts.service';

export interface CreateContactDto {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  manufacturerId?: string;
  supplierId?: string;
}

export interface UpdateContactDto {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
  isActive?: boolean;
}

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  findAll(
    @Query('manufacturerId') manufacturerId?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.contactsService.findAll({ manufacturerId, supplierId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactsService.update(id, updateContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }

  // Специални endpoints за управление на основния контакт
  @Patch(':id/set-primary')
  setPrimary(@Param('id') id: string) {
    return this.contactsService.setPrimary(id);
  }
} 