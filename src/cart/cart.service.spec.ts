import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CartService } from './cart.service';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { PromotionService } from './promotion/promotion.service';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import { User, UserType } from '../users/entities/user.entity';
import { Products } from '../products/entities/products.entity';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockProductsService = {
  findOne: jest.fn(),
};
const mockUsersService = {
  findOne: jest.fn(),
};
const mockPromotionService = {
  calculateBestPrice: jest.fn(),
};

describe('CartService', () => {
  let service: CartService;
  let cartRepository: MockRepository<Cart>;
  let cartItemRepository: MockRepository<CartItem>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: createMockRepository(),
        },
        { provide: ProductsService, useValue: mockProductsService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: PromotionService, useValue: mockPromotionService },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addItem', () => {
    const itemDto: AddItemCartDto = {
      productId: 'prod-1',
      quantity: 1,
      items: [],
    };
    const product = { id: 'prod-1', name: 'T-shirt', price: 35.99 } as Products;

    it('should create a new cart if cartId is not provided', async () => {
      const newCart = { id: 'cart-1', items: [] } as Cart;
      cartRepository.create.mockReturnValue(newCart);
      cartRepository.findOne.mockReturnValue(newCart);
      mockProductsService.findOne.mockReturnValue(product);

      await service.addItem(itemDto);

      expect(cartRepository.create).toHaveBeenCalled();
      expect(cartRepository.save).toHaveBeenCalledWith(newCart);
      expect(cartItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ product, quantity: itemDto.quantity }),
      );
    });

    it('should add item to an existing cart', async () => {
      const cartId = 'cart-exists';
      const existingCart = { id: cartId, items: [] } as Cart;
      cartRepository.findOne.mockResolvedValue(existingCart);
      mockProductsService.findOne.mockResolvedValue(product);

      await service.addItem(itemDto, cartId);

      expect(cartItemRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ product, quantity: 1 }),
      );
      expect(cartItemRepository.save).toHaveBeenCalled();
    });

    it('should update quantity if item already exists in cart', async () => {
      const existingItem = { id: 'item-1', product, quantity: 1 } as CartItem;
      const cart = { id: 'cart-1', items: [existingItem] } as Cart;

      cartRepository.findOne.mockResolvedValue(cart);
      mockProductsService.findOne.mockResolvedValue(product);

      await service.addItem(itemDto, 'cart-1');

      expect(existingItem.quantity).toBe(2);
      expect(cartItemRepository.save).toHaveBeenCalledWith(existingItem);
      expect(cartItemRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if cart not found', async () => {
      cartRepository.findOne.mockReturnValue(null);
      await expect(service.addItem(itemDto, 'wrong-cart-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductsService.findOne.mockReturnValue(null);
      await expect(service.addItem(itemDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCartTotal', () => {
    const cartId = 'cart-1';
    const userId = 'user-1';
    const cart = { id: cartId, items: [], user: null } as Cart;
    const user = { id: userId, type: UserType.VIP } as User;

    it('should calculate total and associate user with cart', async () => {
      cartRepository.findOne.mockResolvedValue(cart);
      mockUsersService.findOne.mockResolvedValue(user);
      mockPromotionService.calculateBestPrice.mockReturnValue({
        finalTotal: 100,
      });

      const result = await service.getCartTotal(cartId, userId);

      expect(cart.user).toEqual(user);
      expect(cartRepository.save).toHaveBeenCalledWith(cart);
      expect(mockPromotionService.calculateBestPrice).toHaveBeenCalledWith(
        user,
        cart,
      );
      expect(result).toEqual({ finalTotal: 100 });
    });

    it('should throw NotFoundException if cart is not found', async () => {
      cartRepository.findOne.mockResolvedValue(null);
      await expect(service.getCartTotal(cartId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeItem', () => {
    const cartId = 'cart-1';
    const itemId = 'item-1';
    const itemToRemove = { id: itemId } as CartItem;

    it('should remove an item from the cart', async () => {
      cartItemRepository.findOne.mockResolvedValue(itemToRemove);

      await service.removeItem(cartId, itemId);

      expect(cartItemRepository.remove).toHaveBeenCalledWith(itemToRemove);
    });

    it('should return a success message on removal', async () => {
      cartItemRepository.findOne.mockResolvedValue(itemToRemove);
      const result = await service.removeItem(cartId, itemId);
      expect(result).toContain('removido');
    });

    it('should throw NotFoundException if item to remove is not found', async () => {
      cartItemRepository.findOne.mockResolvedValue(null);
      await expect(service.removeItem(cartId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
