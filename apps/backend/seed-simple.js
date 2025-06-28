const { PrismaClient } = require('./generated');

const prisma = new PrismaClient();

async function testPrisma() {
  console.log('🧪 Testing Prisma client...');
  
  try {
    console.log('Available models:', Object.keys(prisma));
    
    // Test if we can access the models
    console.log('Testing manufacturer model...');
    const manufacturerCount = await prisma.manufacturer.count();
    console.log('Manufacturer count:', manufacturerCount);
    
    console.log('Testing productType model...');
    const productTypeCount = await prisma.productType.count();
    console.log('ProductType count:', productTypeCount);
    
    console.log('✅ Prisma client working correctly!');
    
  } catch (error) {
    console.error('❌ Prisma client error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma(); 