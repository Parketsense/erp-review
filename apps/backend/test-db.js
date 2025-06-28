const { PrismaClient } = require('./generated');

const prisma = new PrismaClient();

async function testDb() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test clients query
    console.log('🔍 Testing clients query...');
    const clients = await prisma.client.findMany({
      take: 1
    });
    console.log(`✅ Found ${clients.length} clients`);
    
    // Test manufacturers query
    console.log('🔍 Testing manufacturers query...');
    const manufacturers = await prisma.manufacturer.findMany({
      take: 1
    });
    console.log(`✅ Found ${manufacturers.length} manufacturers`);
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDb(); 