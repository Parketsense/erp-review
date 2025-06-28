import { Module } from '@nestjs/common';
import { RoomProductsController } from './room-products.controller';
import { RoomProductsService } from './room-products.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomProductsController],
  providers: [RoomProductsService],
  exports: [RoomProductsService],
})
export class RoomProductsModule {} 