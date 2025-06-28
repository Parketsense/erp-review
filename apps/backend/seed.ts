import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'admin@parketsense.bg',
      password: 'password123', // In real app, this should be hashed
      name: 'Георги Петков',
      phone: '+359888123456',
      role: 'ADMIN',
    },
  });

  console.log('Created user:', user);

  // Create a test client
  const client = await prisma.client.create({
    data: {
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+359888999000',
      email: 'ivan@example.com',
      address: 'София, ул. Витоша 15',
      hasCompany: true,
      companyName: 'Петров Дизайн ЕООД',
      eikBulstat: '123456789',
      isArchitect: true,
      commissionPercent: 15,
      createdBy: user.id,
    },
  });

  console.log('Created client:', client);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
