import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post('variant/:variantId')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    try {
      const room = await this.roomsService.create(variantId, createRoomDto);
      return {
        success: true,
        data: room,
        message: 'Room created successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      const rooms = await this.roomsService.findAll();
      return {
        success: true,
        data: rooms,
        message: 'Rooms retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.roomsService.getStats();
      return {
        success: true,
        data: stats,
        message: 'Room stats retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('variant/:variantId')
  async findByVariant(@Param('variantId', ParseUUIDPipe) variantId: string) {
    try {
      const rooms = await this.roomsService.findByVariant(variantId);
      return {
        success: true,
        data: rooms,
        message: 'Variant rooms retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const room = await this.roomsService.findOne(id);
      return {
        success: true,
        data: room,
        message: 'Room retrieved successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ) {
    try {
      const room = await this.roomsService.update(id, updateRoomDto);
      return {
        success: true,
        data: room,
        message: 'Room updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      await this.roomsService.remove(id);
      return {
        success: true,
        message: 'Room deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name?: string },
  ) {
    try {
      const duplicatedRoom = await this.roomsService.duplicateRoom(id, body.name);
      return {
        success: true,
        data: duplicatedRoom,
        message: 'Room duplicated successfully',
      };
    } catch (error) {
      throw error;
    }
  }
} 