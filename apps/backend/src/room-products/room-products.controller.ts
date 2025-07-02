import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoomProductsService } from './room-products.service';
import { CreateRoomProductDto } from './dto/create-room-product.dto';
import { UpdateRoomProductDto } from './dto/update-room-product.dto';

@Controller('room-products')
export class RoomProductsController {
  constructor(private readonly roomProductsService: RoomProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoomProductDto: CreateRoomProductDto) {
    return this.roomProductsService.create(createRoomProductDto);
  }

  @Get('stats')
  getStats() {
    return this.roomProductsService.getStats();
  }

  @Get('room/:roomId')
  findByRoom(@Param('roomId', ParseUUIDPipe) roomId: string) {
    return this.roomProductsService.findByRoom(roomId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomProductsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateRoomProductDto: UpdateRoomProductDto
  ) {
    return this.roomProductsService.update(id, updateRoomProductDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomProductsService.remove(id);
  }
} 