const { PrismaClient } = require('./generated');
const fs = require('fs');

const prisma = new PrismaClient();

async function backup() {
  try {
    console.log('🔄 Starting data backup...');
    
    const data = {
      productTypes: await prisma.productType.findMany(),
      manufacturers: await prisma.manufacturer.findMany(),
      clients: await prisma.client.findMany(),
      users: await prisma.user.findMany(),
      products: await prisma.product.findMany()
    };
    
    fs.writeFileSync('data-backup.json', JSON.stringify(data, null, 2));
    console.log('✅ Data backed up to data-backup.json');
    console.log(`   - ${data.productTypes.length} product types`);
    console.log(`   - ${data.manufacturers.length} manufacturers`);
    console.log(`   - ${data.clients.length} clients`);
    console.log(`   - ${data.users.length} users`);
    console.log(`   - ${data.products.length} products`);
    
  } catch(e) {
    console.error('❌ Backup failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

backup(); 