const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function migrateData() {
  console.log('🚀 Starting data migration...');
  
  // Initialize Prisma with the OLD schema
  const oldPrisma = new PrismaClient();
  
  try {
    // 1. Backup existing data
    console.log('📁 Backing up existing data...');
    
    const existingClients = await oldPrisma.client.findMany();
    const existingProducts = await oldPrisma.product.findMany();
    const existingUsers = await oldPrisma.user.findMany();
    
    console.log(`Found ${existingClients.length} clients, ${existingProducts.length} products, ${existingUsers.length} users`);
    
    // Save backup
    const backup = {
      clients: existingClients,
      products: existingProducts,
      users: existingUsers,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('./data-backup.json', JSON.stringify(backup, null, 2));
    console.log('✅ Data backed up to data-backup.json');
    
    await oldPrisma.$disconnect();
    
    // 2. Reset database and apply new schema
    console.log('🔄 Resetting database...');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    await execPromise('npx prisma migrate reset --force --skip-seed');
    console.log('✅ Database reset complete');
    
    // 3. Initialize Prisma with NEW schema
    const newPrisma = new PrismaClient();
    
    // 4. Create initial seed data for attribute system
    console.log('🌱 Creating initial seed data...');
    
    // Create default manufacturers
    const manufacturers = [
      { name: 'hickx', displayName: 'Hickx', colorCode: '#e67e22' },
      { name: 'bauwerk', displayName: 'Bauwerk', colorCode: '#8e44ad' },
      { name: 'foglie-doro', displayName: 'Foglie d\'Oro', colorCode: '#f39c12' },
      { name: 'quick-step', displayName: 'Quick-Step', colorCode: '#3498db' },
      { name: 'general', displayName: 'Общи', colorCode: '#6c757d' }
    ];
    
    const createdManufacturers = {};
    for (const manuf of manufacturers) {
      const created = await newPrisma.manufacturer.create({ data: manuf });
      createdManufacturers[manuf.name] = created;
    }
    
    // Create product types
    const productTypes = [
      { name: 'parquet', nameBg: 'Паркет', nameEn: 'Parquet', icon: '🏠', displayOrder: 1 },
      { name: 'doors', nameBg: 'Врати', nameEn: 'Doors', icon: '🚪', displayOrder: 2 },
      { name: 'furniture', nameBg: 'Мебели', nameEn: 'Furniture', icon: '🪑', displayOrder: 3 }
    ];
    
    const createdProductTypes = {};
    for (const type of productTypes) {
      const created = await newPrisma.productType.create({ data: type });
      createdProductTypes[type.name] = created;
    }
    
    // Create attribute types for parquet
    const parquetAttributeTypes = [
      { name: 'wood_type', nameBg: 'Дървесина', nameEn: 'Wood Type', type: 'select', isRequired: true, displayOrder: 1 },
      { name: 'thickness', nameBg: 'Дебелина', nameEn: 'Thickness', type: 'select', isRequired: true, displayOrder: 2 },
      { name: 'color', nameBg: 'Цвят', nameEn: 'Color', type: 'color', isRequired: true, displayOrder: 3 },
      { name: 'finish', nameBg: 'Финиш', nameEn: 'Finish', type: 'select', isRequired: false, displayOrder: 4 }
    ];
    
    const createdAttributeTypes = {};
    for (const attr of parquetAttributeTypes) {
      const created = await newPrisma.attributeType.create({ 
        data: { ...attr, productTypeId: createdProductTypes.parquet.id }
      });
      createdAttributeTypes[attr.name] = created;
    }
    
    // Create some default attribute values
    const attributeValues = [
      // Wood types
      { nameBg: 'Дъб', nameEn: 'Oak', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 1 },
      { nameBg: 'Орех', nameEn: 'Walnut', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 2 },
      { nameBg: 'Ясен', nameEn: 'Ash', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 3 },
      
      // Thickness
      { nameBg: '14мм', nameEn: '14mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 1 },
      { nameBg: '15мм', nameEn: '15mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 2 },
      { nameBg: '20мм', nameEn: '20mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 3 },
      
      // Colors
      { nameBg: 'Натурален', nameEn: 'Natural', colorCode: '#d4af37', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 1 },
      { nameBg: 'Тъмен орех', nameEn: 'Dark Walnut', colorCode: '#8b4513', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 2 },
      { nameBg: 'Светъл дъб', nameEn: 'Light Oak', colorCode: '#f5deb3', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 3 },
      
      // Finish
      { nameBg: 'Мат', nameEn: 'Matte', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 1 },
      { nameBg: 'Сатен', nameEn: 'Satin', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 2 },
      { nameBg: 'Гланц', nameEn: 'Gloss', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 3 }
    ];
    
    for (const value of attributeValues) {
      await newPrisma.attributeValue.create({ data: value });
    }
    
    console.log('✅ Initial seed data created');
    
    // 5. Migrate existing users (they should work with minimal changes)
    console.log('👤 Migrating users...');
    for (const user of existingUsers) {
      await newPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.toLowerCase() || 'user',
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${existingUsers.length} users`);
    
    // 6. Migrate existing clients
    console.log('👥 Migrating clients...');
    for (const client of existingClients) {
      const clientName = client.hasCompany && client.companyName 
        ? client.companyName 
        : `${client.firstName} ${client.lastName}`;
        
      await newPrisma.client.create({
        data: {
          id: client.id,
          name: clientName,
          eik: client.eikBulstat,
          mol: client.companyMol,
          address: client.hasCompany ? client.companyAddress : client.address,
          phone: client.hasCompany ? client.companyPhone : client.phone,
          email: client.hasCompany ? client.companyEmail : client.email,
          contactPerson: client.hasCompany ? `${client.firstName} ${client.lastName}` : null,
          isActive: client.isActive,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
          createdById: client.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${existingClients.length} clients`);
    
    // 7. Migrate existing products
    console.log('📦 Migrating products...');
    const generalManufacturerId = createdManufacturers.general.id;
    const parquetTypeId = createdProductTypes.parquet.id;
    
    for (const product of existingProducts) {
      // Map old category to new product type
      let productTypeId = parquetTypeId; // default
      if (product.category === 'FURNITURE') {
        productTypeId = createdProductTypes.furniture.id;
      } else if (product.category === 'LAMINATE' || product.category === 'VINYL') {
        productTypeId = parquetTypeId; // treat as parquet for now
      }
      
      await newPrisma.product.create({
        data: {
          id: product.id,
          code: product.code,
          nameBg: product.name,
          nameEn: product.name, // same for now
          productTypeId: productTypeId,
          manufacturerId: generalManufacturerId, // assign to general manufacturer
          supplier: product.supplier,
          unit: product.measureUnit || 'm2',
          costEur: product.priceEur,
          costBgn: product.priceBgn,
          isActive: product.isActive,
          isRecommended: product.isFeatured || false,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          createdById: product.createdBy
        }
      });
    }
    console.log(`✅ Migrated ${existingProducts.length} products`);
    
    await newPrisma.$disconnect();
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await oldPrisma.$disconnect();
    process.exit(1);
  }
}

if (require.main === module) {
  migrateData();
}

module.exports = { migrateData }; 