import { Module } from '@nestjs/common';
import { RoomProductsService } from './room-products.service';
import { RoomProductsController } from './room-products.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomProductsController],
  providers: [RoomProductsService],
  exports: [RoomProductsService],
})
export class RoomProductsModule {} 