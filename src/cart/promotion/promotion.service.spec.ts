import { Test, TestingModule } from '@nestjs/testing';
import { PromotionService } from './promotion.service';
import { User, UserType } from '../../users/entities/user.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Products } from '../../products/entities/products.entity';

const mockTshirt: Products = {
  id: 'uuid-tshirt',
  name: 'T-shirt',
  price: 35.99,
};
const mockJeans: Products = { id: 'uuid-jeans', name: 'Jeans', price: 65.5 };
const mockDress: Products = { id: 'uuid-dress', name: 'Dress', price: 80.75 };

const commonUser: User = {
  id: 'uuid-common',
  name: 'Common User',
  type: UserType.COMMON,
  cart: null,
};
const vipUser: User = {
  id: 'uuid-vip',
  name: 'VIP User',
  type: UserType.VIP,
  cart: null,
};

const createMockCart = (...items: [Products, number][]): Cart => {
  const cartItems: CartItem[] = items.map(([product, quantity], index) => ({
    id: `uuid-item-${index}`,
    product,
    quantity,
    cart: null,
  }));

  return {
    id: 'uuid-cart',
    user: null,
    items: cartItems,
  };
};

describe('PromotionService', () => {
  let service: PromotionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionService],
    }).compile();

    service = module.get<PromotionService>(PromotionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Common User Scenarios', () => {
    it('should not apply any discount for less than 3 items', () => {
      const cart = createMockCart([mockTshirt, 2]);
      const result = service.calculateBestPrice(commonUser, cart);

      expect(result.promotionApplied).toBeNull();
      expect(result.discountAmount).toBe(0);
      expect(result.finalTotal).toBe(71.98);
    });

    it('should apply "3 for 2" for 3 identical items', () => {
      const cart = createMockCart([mockTshirt, 3]);
      const result = service.calculateBestPrice(commonUser, cart);

      expect(result.promotionApplied).toBe('Get 3 for the Price of 2');
      expect(result.discountAmount).toBe(35.99);
      expect(result.finalTotal).toBe(71.98);
    });

    it('should apply "3 for 2" for 4 items, making the cheapest one free', () => {
      const cart = createMockCart([mockJeans, 2], [mockTshirt, 2]);
      const result = service.calculateBestPrice(commonUser, cart);

      expect(result.promotionApplied).toBe('Get 3 for the Price of 2');
      expect(result.discountAmount).toBe(35.99);
      expect(result.finalTotal).toBe(166.99);
    });

    it('should apply "3 for 2" twice for 6 items', () => {
      const cart = createMockCart([mockDress, 6]);
      const result = service.calculateBestPrice(commonUser, cart);

      expect(result.promotionApplied).toBe('Get 3 for the Price of 2');
      expect(result.discountAmount).toBe(161.5);
      expect(result.finalTotal).toBe(323.0);
    });
  });

  describe('VIP User Scenarios', () => {
    it('should choose "VIP Discount" when it is more advantageous', () => {
      const cart = createMockCart([mockJeans, 2]);
      const result = service.calculateBestPrice(vipUser, cart);

      expect(result.promotionApplied).toBe('VIP Discount (15%)');
      expect(result.finalTotal).toBe(111.35);
      expect(result.recommendationMessage).toContain('VIP Discount (15%)');
    });

    it('should choose "3 for 2" when it is more advantageous', () => {
      const cart = createMockCart([mockDress, 3]);
      const result = service.calculateBestPrice(vipUser, cart);

      expect(result.promotionApplied).toBe('Get 3 for the Price of 2');
      expect(result.finalTotal).toBe(161.5);
      expect(result.recommendationMessage).toContain(
        'Get 3 for the Price of 2',
      );
    });

    it('should correctly compare promotions for a mixed cart', () => {
      const cart = createMockCart([mockTshirt, 4], [mockJeans, 1]);
      const result = service.calculateBestPrice(vipUser, cart);

      expect(result.promotionApplied).toBe('Get 3 for the Price of 2');
      expect(result.finalTotal).toBe(173.47);
      expect(result.recommendationMessage).toContain(
        'Get 3 for the Price of 2',
      );
    });
  });
});
