import { Test, TestingModule } from '@nestjs/testing';
import { ClientsService } from './clients.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

describe('ClientsService', () => {
  let service: ClientsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    client: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientsService>(ClientsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a client and return an object containing id and name', async () => {
      const createClientDto: CreateClientDto = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john.doe@example.com',
        address: '123 Main St',
        hasCompany: false,
        isArchitect: false,
      };

      const mockCreatedClient = {
        id: 'test-client-id',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john.doe@example.com',
        address: '123 Main St',
        hasCompany: false,
        isArchitect: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: {
          id: 'user-id',
          name: 'Test User',
        },
      };

      mockPrismaService.client.findFirst.mockResolvedValue(null); // No existing client
      mockPrismaService.client.create.mockResolvedValue(mockCreatedClient);

      const result = await service.create(createClientDto, 'user-id');

      expect(result).toEqual({
        success: true,
        data: mockCreatedClient,
        message: 'Client created successfully',
      });
      expect(result.data).toHaveProperty('id');
      expect(result.data).toHaveProperty('firstName');
      expect(result.data).toHaveProperty('lastName');
      expect(mockPrismaService.client.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890',
          email: 'john.doe@example.com',
          address: '123 Main St',
          hasCompany: false,
          isArchitect: false,
          createdById: 'user-id',
        }),
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });

  describe('findAll (findActive)', () => {
    it('should return only items where isActive=true by default', async () => {
      const mockActiveClients = [
        {
          id: 'client-1',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date(),
          createdBy: { id: 'user-1', name: 'User 1' },
        },
        {
          id: 'client-2',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
          createdAt: new Date(),
          createdBy: { id: 'user-2', name: 'User 2' },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockActiveClients);
      mockPrismaService.client.count.mockResolvedValue(2);

      const result = await service.findAll();

      expect(result).toEqual({
        success: true,
        data: mockActiveClients,
        pagination: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
        },
      });

      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(mockPrismaService.client.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });

      // Verify all returned clients are active
      result.data.forEach(client => {
        expect(client.isActive).toBe(true);
      });
    });

    it('should include inactive clients when includeInactive is true', async () => {
      const mockAllClients = [
        {
          id: 'client-1',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date(),
          createdBy: { id: 'user-1', name: 'User 1' },
        },
        {
          id: 'client-2',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: false,
          createdAt: new Date(),
          createdBy: { id: 'user-2', name: 'User 2' },
        },
      ];

      mockPrismaService.client.findMany.mockResolvedValue(mockAllClients);
      mockPrismaService.client.count.mockResolvedValue(2);

      const result = await service.findAll({ includeInactive: true });

      expect(result.data).toHaveLength(2);
      expect(result.data.some(client => client.isActive === false)).toBe(true);
      expect(mockPrismaService.client.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });
  });
});
