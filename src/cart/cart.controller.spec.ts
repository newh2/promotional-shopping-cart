import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import { Cart } from './entities/cart.entity';

const mockCartService = {
  addItem: jest.fn(),
  removeItem: jest.fn(),
  getCartTotal: jest.fn(),
};

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addItemToCart', () => {
    it('should call cartService.addItem with a DTO and cartId', async () => {
      const addItemDto: AddItemCartDto = {
        productId: 'uuid-product-1',
        quantity: 2,
      };
      const cartId = 'uuid-cart-1';
      const expectedCart = { id: cartId, items: [] } as Cart;

      mockCartService.addItem.mockReturnValue(expectedCart);

      const result = await controller.addItemToCart(addItemDto, cartId);

      expect(service.addItem).toHaveBeenCalledWith(addItemDto, cartId);
      expect(result).toEqual(expectedCart);
    });

    it('should call cartService.addItem without a cartId (for new carts)', async () => {
      const addItemDto: AddItemCartDto = {
        productId: 'uuid-product-1',
        quantity: 1,
      };
      const newCart = { id: 'new-cart-uuid', items: [] } as Cart;

      mockCartService.addItem.mockReturnValue(newCart);

      const result = await controller.addItemToCart(addItemDto);

      expect(service.addItem).toHaveBeenCalledWith(addItemDto, undefined);
      expect(result).toEqual(newCart);
    });
  });

  describe('removeItemFromCart', () => {
    it('should call cartService.removeItem with cartId and itemId', async () => {
      const cartId = 'uuid-cart-1';
      const itemId = 'uuid-item-1';
      const expectedCart = { id: cartId, items: [] } as Cart;

      mockCartService.removeItem.mockReturnValue(expectedCart);

      const result = await controller.removeItemFromCart(cartId, itemId);

      expect(service.removeItem).toHaveBeenCalledWith(cartId, itemId);
      expect(result).toEqual(expectedCart);
    });
  });

  describe('getCartTotal', () => {
    it('should call cartService.getCartTotal with cartId and userId', async () => {
      const cartId = 'uuid-cart-1';
      const userId = 'uuid-user-1';
      const expectedTotal = { finalTotal: 100.0, promotionApplied: 'VIP' };

      mockCartService.getCartTotal.mockReturnValue(expectedTotal);

      const result = await controller.getCartTotal(cartId, userId);

      expect(service.getCartTotal).toHaveBeenCalledWith(cartId, userId);
      expect(result).toEqual(expectedTotal);
    });
  });
});
