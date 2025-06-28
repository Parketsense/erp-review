import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { ManufacturersService } from './manufacturers/manufacturers.service';
import { SuppliersService } from './suppliers/suppliers.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly manufacturersService: ManufacturersService,
    private readonly suppliersService: SuppliersService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('demo/attribute-system')
  async getDemoAttributeSystem() {
    try {
      const [productTypes, manufacturers, attributeValues] = await Promise.all([
        this.prisma.productType.findMany({
          include: {
            attributeTypes: {
              include: {
                attributeValues: {
                  take: 3
                }
              }
            }
          }
        }),
        this.prisma.manufacturer.findMany(),
        this.prisma.attributeValue.count()
      ]);

      return {
        success: true,
        message: 'Attribute system working!',
        data: {
          productTypes: productTypes.length,
          manufacturers: manufacturers.length,
          attributeValues,
          sampleData: {
            productTypes: productTypes.map(pt => ({
              id: pt.id,
              nameBg: pt.nameBg,
              attributeCount: pt.attributeTypes?.length || 0
            })),
            manufacturers: manufacturers.map(m => ({
              id: m.id,
              displayName: m.displayName,
              colorCode: m.colorCode
            }))
          }
        }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error fetching attribute system data',
        error: error.message
      };
    }
  }

  @Get('migrate/manufacturers-to-suppliers')
  async migrateManufacturersToSuppliers() {
    try {
      console.log('🔄 Starting migration of manufacturers to suppliers...');
      
      // Вземи всички производители
      const manufacturers = await this.manufacturersService.findAll();
      console.log(`📊 Found ${manufacturers.length} manufacturers to migrate`);
      
      let createdCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      const errors = [];

      for (const manufacturer of manufacturers) {
        try {
          const supplierData = {
            name: manufacturer.name,
            displayName: manufacturer.displayName,
            code: manufacturer.code,
            website: manufacturer.website,
            description: manufacturer.description,
            address: manufacturer.address,
            contactName: manufacturer.contactName,
            contactEmail: manufacturer.contactEmail,
            contactPhone: manufacturer.contactPhone,
            colorCode: manufacturer.colorCode,
            discount: manufacturer.discount,
          };

          // Проверки дали доставчик вече съществува
          const existingSuppliers = await this.suppliersService.findAll();
          const existingSupplier = existingSuppliers.find(s => 
            s.name === manufacturer.name || 
            (manufacturer.code && s.code === manufacturer.code)
          );

          if (existingSupplier) {
            // Обнови съществуващия доставчик
            await this.suppliersService.update(existingSupplier.id, supplierData);
            updatedCount++;
            console.log(`✅ Updated supplier: ${manufacturer.name}`);
          } else {
            // Създай нов доставчик
            await this.suppliersService.create(supplierData);
            createdCount++;
            console.log(`🆕 Created supplier: ${manufacturer.name}`);
          }
        } catch (error) {
          console.error(`❌ Error migrating manufacturer ${manufacturer.name}:`, error.message);
          errors.push({ manufacturer: manufacturer.name, error: error.message });
          skippedCount++;
        }
      }

      const result = {
        success: true,
        message: 'Migration completed',
        statistics: {
          totalManufacturers: manufacturers.length,
          created: createdCount,
          updated: updatedCount,
          skipped: skippedCount,
          errors: errors.length
        },
        errors
      };

      console.log('✅ Migration completed:', result.statistics);
      return result;
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        message: 'Migration failed',
        error: error.message
      };
    }
  }
}
