const { PrismaClient } = require('./generated');
const fs = require('fs');

const prisma = new PrismaClient();

async function seedAttributeSystem() {
  console.log('🌱 Seeding attribute system...');

  try {
    // 1. Create default manufacturers
    console.log('Creating manufacturers...');
    const manufacturers = [
      { name: 'hickx', displayName: 'Hickx', colorCode: '#e67e22' },
      { name: 'bauwerk', displayName: 'Bauwerk', colorCode: '#8e44ad' },
      { name: 'foglie-doro', displayName: 'Foglie d\'Oro', colorCode: '#f39c12' },
      { name: 'quick-step', displayName: 'Quick-Step', colorCode: '#3498db' },
      { name: 'general', displayName: 'Общи', colorCode: '#6c757d' }
    ];
    
    const createdManufacturers = {};
    for (const manuf of manufacturers) {
      const created = await prisma.manufacturer.create({ data: manuf });
      createdManufacturers[manuf.name] = created;
      console.log(`✅ Created manufacturer: ${manuf.displayName}`);
    }
    
    // 2. Create product types
    console.log('Creating product types...');
    const productTypes = [
      { name: 'parquet', nameBg: 'Паркет', nameEn: 'Parquet', icon: '🏠', displayOrder: 1 },
      { name: 'doors', nameBg: 'Врати', nameEn: 'Doors', icon: '🚪', displayOrder: 2 },
      { name: 'furniture', nameBg: 'Мебели', nameEn: 'Furniture', icon: '🪑', displayOrder: 3 }
    ];
    
    const createdProductTypes = {};
    for (const type of productTypes) {
      const created = await prisma.productType.create({ data: type });
      createdProductTypes[type.name] = created;
      console.log(`✅ Created product type: ${type.nameBg}`);
    }
    
    // 3. Create attribute types for parquet
    console.log('Creating attribute types...');
    const parquetAttributeTypes = [
      { name: 'wood_type', nameBg: 'Дървесина', nameEn: 'Wood Type', type: 'select', isRequired: true, displayOrder: 1 },
      { name: 'thickness', nameBg: 'Дебелина', nameEn: 'Thickness', type: 'select', isRequired: true, displayOrder: 2 },
      { name: 'color', nameBg: 'Цвят', nameEn: 'Color', type: 'color', isRequired: true, displayOrder: 3 },
      { name: 'finish', nameBg: 'Финиш', nameEn: 'Finish', type: 'select', isRequired: false, displayOrder: 4 },
      { name: 'width', nameBg: 'Ширина', nameEn: 'Width', type: 'select', isRequired: false, displayOrder: 5 },
      { name: 'length', nameBg: 'Дължина', nameEn: 'Length', type: 'select', isRequired: false, displayOrder: 6 }
    ];
    
    const createdAttributeTypes = {};
    for (const attr of parquetAttributeTypes) {
      const created = await prisma.attributeType.create({ 
        data: { ...attr, productTypeId: createdProductTypes.parquet.id }
      });
      createdAttributeTypes[attr.name] = created;
      console.log(`✅ Created attribute type: ${attr.nameBg}`);
    }
    
    // 4. Create attribute values
    console.log('Creating attribute values...');
    const attributeValues = [
      // Wood types
      { nameBg: 'Дъб', nameEn: 'Oak', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 1 },
      { nameBg: 'Орех', nameEn: 'Walnut', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 2 },
      { nameBg: 'Ясен', nameEn: 'Ash', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 3 },
      { nameBg: 'Бук', nameEn: 'Beech', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 4 },
      { nameBg: 'Череша', nameEn: 'Cherry', attributeTypeId: createdAttributeTypes.wood_type.id, sortOrder: 5 },
      
      // Thickness
      { nameBg: '14мм', nameEn: '14mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 1 },
      { nameBg: '15мм', nameEn: '15mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 2 },
      { nameBg: '20мм', nameEn: '20mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 3 },
      { nameBg: '22мм', nameEn: '22mm', attributeTypeId: createdAttributeTypes.thickness.id, sortOrder: 4 },
      
      // Colors
      { nameBg: 'Натурален', nameEn: 'Natural', colorCode: '#d4af37', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 1 },
      { nameBg: 'Тъмен орех', nameEn: 'Dark Walnut', colorCode: '#8b4513', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 2 },
      { nameBg: 'Светъл дъб', nameEn: 'Light Oak', colorCode: '#f5deb3', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 3 },
      { nameBg: 'Тъмен дъб', nameEn: 'Dark Oak', colorCode: '#654321', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 4 },
      { nameBg: 'Бял', nameEn: 'White', colorCode: '#ffffff', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 5 },
      { nameBg: 'Сив', nameEn: 'Grey', colorCode: '#808080', attributeTypeId: createdAttributeTypes.color.id, sortOrder: 6 },
      
      // Finish
      { nameBg: 'Мат', nameEn: 'Matte', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 1 },
      { nameBg: 'Сатен', nameEn: 'Satin', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 2 },
      { nameBg: 'Гланц', nameEn: 'Gloss', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 3 },
      { nameBg: 'Ултра мат', nameEn: 'Ultra Matte', attributeTypeId: createdAttributeTypes.finish.id, sortOrder: 4 },
      
      // Width
      { nameBg: '60мм', nameEn: '60mm', attributeTypeId: createdAttributeTypes.width.id, sortOrder: 1 },
      { nameBg: '90мм', nameEn: '90mm', attributeTypeId: createdAttributeTypes.width.id, sortOrder: 2 },
      { nameBg: '120мм', nameEn: '120mm', attributeTypeId: createdAttributeTypes.width.id, sortOrder: 3 },
      { nameBg: '180мм', nameEn: '180mm', attributeTypeId: createdAttributeTypes.width.id, sortOrder: 4 },
      { nameBg: '200мм', nameEn: '200mm', attributeTypeId: createdAttributeTypes.width.id, sortOrder: 5 },
      
      // Length
      { nameBg: '400мм', nameEn: '400mm', attributeTypeId: createdAttributeTypes.length.id, sortOrder: 1 },
      { nameBg: '600мм', nameEn: '600mm', attributeTypeId: createdAttributeTypes.length.id, sortOrder: 2 },
      { nameBg: '900мм', nameEn: '900mm', attributeTypeId: createdAttributeTypes.length.id, sortOrder: 3 },
      { nameBg: '1200мм', nameEn: '1200mm', attributeTypeId: createdAttributeTypes.length.id, sortOrder: 4 },
      { nameBg: '1800мм', nameEn: '1800mm', attributeTypeId: createdAttributeTypes.length.id, sortOrder: 5 }
    ];
    
    for (const value of attributeValues) {
      await prisma.attributeValue.create({ data: value });
    }
    console.log(`✅ Created ${attributeValues.length} attribute values`);
    
    // 5. Restore backed up data if exists
    if (fs.existsSync('./data-backup.json')) {
      console.log('📦 Restoring backed up data...');
      const backup = JSON.parse(fs.readFileSync('./data-backup.json', 'utf8'));
      
      // Restore users
      for (const user of backup.users) {
        await prisma.user.create({
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
      console.log(`✅ Restored ${backup.users.length} users`);
      
      // Restore clients
      for (const client of backup.clients) {
        const clientName = client.hasCompany && client.companyName 
          ? client.companyName 
          : `${client.firstName} ${client.lastName}`;
          
        await prisma.client.create({
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
      console.log(`✅ Restored ${backup.clients.length} clients`);
      
      // Restore products
      const generalManufacturerId = createdManufacturers.general.id;
      const parquetTypeId = createdProductTypes.parquet.id;
      
      for (const product of backup.products) {
        let productTypeId = parquetTypeId;
        if (product.category === 'FURNITURE') {
          productTypeId = createdProductTypes.furniture.id;
        }
        
        await prisma.product.create({
          data: {
            id: product.id,
            code: product.code,
            nameBg: product.name,
            nameEn: product.name,
            productTypeId: productTypeId,
            manufacturerId: generalManufacturerId,
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
      console.log(`✅ Restored ${backup.products.length} products`);
    }
    
    console.log('🎉 Attribute system seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedAttributeSystem();
}

module.exports = { seedAttributeSystem }; 