import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Products } from './../products/entities/products.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: MockRepository<Products>;

  const mockProduct: Products = { id: 'uuid-1', name: 'T-shirt', price: 35.99 };
  const mockProductList: Products[] = [
    mockProduct,
    { id: 'uuid-2', name: 'Jeans', price: 65.5 },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Products), // Usar a entidade correta
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Products));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Testes para onModuleInit ---
  describe('onModuleInit', () => {
    it('should seed the database if it is empty', async () => {
      productRepository.find.mockResolvedValue([]);

      await service.onModuleInit();

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
    });

    it('should not seed the database if it already has products', async () => {
      productRepository.find.mockResolvedValue(mockProductList);

      await service.onModuleInit();

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      productRepository.find.mockResolvedValue(mockProductList);

      const result = await service.findAll();

      expect(result).toEqual(mockProductList);
      expect(productRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      const productId = 'uuid-1';
      productRepository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: productId,
      });
    });

    it('should return null if product is not found', async () => {
      const productId = 'non-existent-id';
      productRepository.findOneBy.mockResolvedValue(null);

      const result = await service.findOne(productId);

      expect(result).toBeNull();
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: productId,
      });
    });
  });
});
