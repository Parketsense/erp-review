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

// Временен контролер за варианти
import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';

// In-memory storage for variants (temporary solution)
const tempVariantsStorage = new Map<string, any>();

@Controller('variants')
class TempVariantsController {
  @Get('phase/:phaseId')
  async getByPhase(@Param('phaseId') phaseId: string) {
    // Return variants for the specific phase
    const allVariants = Array.from(tempVariantsStorage.values());
    return allVariants.filter(variant => variant.phaseId === phaseId);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const variant = tempVariantsStorage.get(id);
    if (!variant) {
      throw new Error('Variant not found');
    }
    return variant;
  }

  @Post('phase/:phaseId')
  async createVariant(@Param('phaseId') phaseId: string, @Body() body: any) {
    const id = 'variant-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const variant = {
      id,
      phaseId: phaseId,
      name: body.name,
      description: body.description || null,
      variantOrder: 1,
      architect: body.architect || null,
      isTemplate: body.isTemplate || false,
      isActive: true,
      totalCost: 0,
      _count: {
        rooms: 0,
        products: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tempVariantsStorage.set(id, variant);
    return variant;
  }

  @Patch(':id')
  async updateVariant(@Param('id') id: string, @Body() body: any) {
    const variant = tempVariantsStorage.get(id);
    if (!variant) {
      throw new Error('Variant not found');
    }
    
    const updatedVariant = {
      ...variant,
      ...body,
      updatedAt: new Date(),
    };
    
    tempVariantsStorage.set(id, updatedVariant);
    return updatedVariant;
  }

  @Delete(':id')
  async deleteVariant(@Param('id') id: string) {
    const variant = tempVariantsStorage.get(id);
    if (!variant) {
      throw new Error('Variant not found');
    }
    
    tempVariantsStorage.delete(id);
    return { message: 'Variant deleted successfully' };
  }

  @Post(':id/clone')
  async cloneVariant(@Param('id') id: string, @Body() body: any) {
    const originalVariant = tempVariantsStorage.get(id);
    if (!originalVariant) {
      throw new Error('Original variant not found');
    }
    
    const newId = 'variant-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const clonedVariant = {
      ...originalVariant,
      id: newId,
      name: body.name || `${originalVariant.name} (копие)`,
      description: body.description || originalVariant.description,
      phaseId: body.targetPhaseId || originalVariant.phaseId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    tempVariantsStorage.set(newId, clonedVariant);
    return clonedVariant;
  }

  @Get('phase/:phaseId/stats')
  async getStats(@Param('phaseId') phaseId: string) {
    const phaseVariants = Array.from(tempVariantsStorage.values())
      .filter(variant => variant.phaseId === phaseId);
    
    return {
      totalVariants: phaseVariants.length,
      activeVariants: phaseVariants.filter(v => v.isActive).length,
      templateVariants: phaseVariants.filter(v => v.isTemplate).length,
    };
  }
}

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
  controllers: [AppController, TempVariantsController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*');
  }
}
