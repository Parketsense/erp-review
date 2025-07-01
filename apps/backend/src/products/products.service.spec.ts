import { Test } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductsService (unit)', () => {
  let service: ProductsService;

  // 🪝 фалшив Prisma – връща контролирани данни
  const prismaMock = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    productAttributeValue: {
      createMany: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create() should return newly created product', async () => {
    const dto: CreateProductDto = {
      code: 'OAK-XXL-001',
      nameBg: 'Oak XXL',
      productTypeId: 'type-id',
      manufacturerId: 'manufacturer-id',
      isActive: true,
    };

    const mockCreatedProduct = {
      id: '42',
      ...dto,
      nameEn: 'Oak XXL',
      unit: 'm2',
      costEur: 0,
      costBgn: 0,
      saleBgn: 0,
      saleEur: 0,
      markup: 30,
      isRecommended: false,
      isNew: false,
      images: [],
      documents: [],
      models3d: [],
      textures: [],
      productType: { nameBg: 'Flooring', nameEn: 'Flooring' },
      manufacturer: { displayName: 'Oak Co', colorCode: '#8B4513' },
      createdBy: null,
    };

    (prismaMock.product.findFirst as jest.Mock).mockResolvedValue(null); // No existing product
    (prismaMock.product.create as jest.Mock).mockResolvedValue(mockCreatedProduct);

    const result = await service.create(dto);

    expect(result).toEqual({
      success: true,
      data: mockCreatedProduct,
      message: 'Product created successfully',
    });
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('nameBg');
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: 'OAK-XXL-001',
        nameBg: 'Oak XXL',
        productTypeId: 'type-id',
        manufacturerId: 'manufacturer-id',
        isActive: true,
      }),
      include: expect.any(Object),
    });
  });

  it('findAll() should return only isActive=true items by default', async () => {
    const fakeProducts = [
      { id: '1', nameBg: 'Oak', isActive: true, productType: {}, manufacturer: {}, createdBy: null },
      { id: '2', nameBg: 'Walnut', isActive: true, productType: {}, manufacturer: {}, createdBy: null },
    ];

    (prismaMock.product.findMany as jest.Mock).mockResolvedValue(fakeProducts);
    (prismaMock.product.count as jest.Mock).mockResolvedValue(2);

    const result = await service.findAll();

    expect(result).toEqual({
      success: true,
      data: fakeProducts,
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: expect.any(Object),
    });

    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { isActive: true },
    });

    // Verify all returned products are active
    result.data.forEach(product => {
      expect(product.isActive).toBe(true);
    });
  });
}); 