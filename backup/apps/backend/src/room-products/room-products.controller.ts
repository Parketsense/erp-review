import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomProductsService } from './room-products.service';
import { CreateRoomProductDto } from './dto/create-room-product.dto';
import { UpdateRoomProductDto } from './dto/update-room-product.dto';

@Controller('room-products')
export class RoomProductsController {
  constructor(private readonly roomProductsService: RoomProductsService) {}

  @Post()
  create(@Body() createRoomProductDto: CreateRoomProductDto) {
    return this.roomProductsService.create(createRoomProductDto);
  }

  @Get()
  findAll(@Query('roomId') roomId?: string) {
    if (roomId) {
      return this.roomProductsService.findByRoom(roomId);
    }
    return this.roomProductsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomProductsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomProductDto: UpdateRoomProductDto) {
    return this.roomProductsService.update(id, updateRoomProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomProductsService.remove(id);
  }
} 