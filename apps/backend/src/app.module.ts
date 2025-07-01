import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthMiddleware } from './common/auth.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';

// New attribute system modules
import { ProductTypesModule } from './product-types/product-types.module';
import { ManufacturersModule } from './manufacturers/manufacturers.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ContactsModule } from './contacts/contacts.module';
import { AttributeValuesModule } from './attribute-values/attribute-values.module';
import { AttributesModule } from './attributes/attributes.module';
import { ProjectsModule } from './projects/projects.module';
import { PhasesModule } from './phases/phases.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UsersModule,
    ClientsModule,
    ProductsModule,
    AuthModule,
    
    // Attribute system modules
    ProductTypesModule,
    ManufacturersModule,
    SuppliersModule,
    ContactsModule,
    AttributeValuesModule,
    AttributesModule,
    
    // Projects module
    ProjectsModule,
    PhasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
