const { PrismaClient } = require('../generated');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting simple seed...');

  // First check what exists
  const existingProductTypes = await prisma.productType.findMany();
  const existingManufacturers = await prisma.manufacturer.findMany();
  
  console.log('Existing ProductTypes:', existingProductTypes.length);
  console.log('Existing Manufacturers:', existingManufacturers.length);

  // Only create if they don't exist
  if (existingProductTypes.length === 0) {
    console.log('Creating ProductTypes...');
    await prisma.productType.createMany({
      data: [
        {
          id: 'pt_parquet',
          name: 'parquet',
          nameBg: 'Паркет',
          nameEn: 'Parquet',
          icon: '🪵',
          description: 'Твърд дърворезбарски настил',
          displayOrder: 1,
        },
        {
          id: 'pt_doors',
          name: 'doors',
          nameBg: 'Врати',
          nameEn: 'Doors',
          icon: '🚪',
          description: 'Интериорни и входни врати',
          displayOrder: 2,
        },
        {
          id: 'pt_furniture',
          name: 'furniture',
          nameBg: 'Мебели',
          nameEn: 'Furniture',
          icon: '🪑',
          description: 'Офис и домашни мебели',
          displayOrder: 3,
        },
      ]
    });
    console.log('✅ ProductTypes created');
  }

  if (existingManufacturers.length === 0) {
    console.log('Creating Manufacturers...');
    await prisma.manufacturer.createMany({
      data: [
        {
          id: 'mf_hickx',
          name: 'hickx',
          displayName: 'Hickx Паркети',
          code: 'HICKX',
          website: 'https://hickx.bg',
          description: 'Български производител на висококачествени паркети',
          colorCode: '#8B4513',
        },
        {
          id: 'mf_bauwerk',
          name: 'bauwerk',
          displayName: 'Bauwerk',
          code: 'BWK',
          website: 'https://bauwerk-parkett.com',
          description: 'Швейцарски производител на премиум паркети',
          colorCode: '#2C3E50',
        },
        {
          id: 'mf_foglie',
          name: 'foglie',
          displayName: "Foglie d'Oro",
          code: 'FDO',
          website: 'https://fogliedoro.com',
          description: 'Италиански производител на дизайнерски паркети',
          colorCode: '#B8860B',
        },
        {
          id: 'mf_quickstep',
          name: 'quickstep',
          displayName: 'Quick-Step',
          code: 'QS',
          website: 'https://quick-step.com',
          description: 'Белгийски производител на ламинирани подове',
          colorCode: '#DC143C',
        },
        {
          id: 'mf_karelia',
          name: 'karelia',
          displayName: 'Karelia',
          code: 'KRL',
          website: 'https://karelia.com',
          description: 'Финландски производител на паркети',
          colorCode: '#228B22',
        },
      ]
    });
  }

  console.log('✅ Simple seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 