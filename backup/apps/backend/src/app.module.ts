import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { PrismaModule } from './common/prisma/prisma.module';

// Temporarily disable problematic modules
// import { ProjectsModule } from './projects/projects.module';
// import { PhasesModule } from './phases/phases.module';
// import { VariantsModule } from './variants/variants.module';
// import { RoomsModule } from './rooms/rooms.module';
// import { RoomProductsModule } from './room-products/room-products.module';
// import { OffersModule } from './offers/offers.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ClientsModule,
    // Temporarily disabled to fix compilation errors
    // ProjectsModule,
    // PhasesModule,
    // VariantsModule,
    // RoomsModule,
    // RoomProductsModule,
    // OffersModule,
  ],
})
export class AppModule {} 