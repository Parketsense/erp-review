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
      const manufacturersResponse = await this.manufacturersService.findAll();
      const manufacturers = manufacturersResponse.data;
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
            email: (manufacturer as any).email || '',
            phone: (manufacturer as any).phone || '',
            address: manufacturer.address,
            city: (manufacturer as any).city || '',
            country: (manufacturer as any).country || 'Bulgaria',
            postalCode: (manufacturer as any).postalCode || '',
            vatNumber: (manufacturer as any).vatNumber || '',
            discount: manufacturer.discount || 0,
            notes: (manufacturer as any).notes || '',
            colorCode: manufacturer.colorCode,
            isActive: manufacturer.isActive !== false,
          };

          // Провери дали вече съществува в suppliers
          const existingSuppliersResponse = await this.suppliersService.findAll();
          const existingSuppliers = existingSuppliersResponse.data;
          const existingSupplier = existingSuppliers.find((s: any) =>
            s.name === manufacturer.name || s.displayName === manufacturer.displayName
          );

          if (existingSupplier) {
            // Актуализирай съществуващия
            await this.suppliersService.update(existingSupplier.id, supplierData);
            updatedCount++;
            console.log(`✅ Updated supplier: ${manufacturer.displayName}`);
          } else {
            // Създай нов
            await this.suppliersService.create(supplierData);
            createdCount++;
            console.log(`🆕 Created new supplier: ${manufacturer.displayName}`);
          }
        } catch (error) {
          console.error(`❌ Error migrating manufacturer ${manufacturer.displayName}:`, error.message);
          errors.push({ manufacturer: manufacturer.displayName, error: error.message });
          skippedCount++;
        }
      }

      return {
        success: true,
        message: 'Migration completed successfully',
        stats: {
          totalManufacturers: manufacturers.length,
          created: createdCount,
          updated: updatedCount,
          skipped: skippedCount,
          errors: errors.length
        },
        errors
      };
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
