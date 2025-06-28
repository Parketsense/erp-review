const { PrismaClient } = require('./generated');

const prisma = new PrismaClient();

async function testClients() {
  try {
    console.log('🔍 Testing clients service logic...');
    
    // Simulate the findAll method logic
    const options = { page: 1, limit: 10 };
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;
    const where = { isActive: true };
    
    console.log('Query parameters:', { skip, limit, where });
    
    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.client.count({ where }),
    ]);
    
    console.log(`✅ Found ${clients.length} clients, total: ${total}`);
    console.log('First client:', clients[0] ? clients[0].name : 'No clients');
    
  } catch (error) {
    console.error('❌ Clients test failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testClients(); 