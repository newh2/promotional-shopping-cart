import { Injectable } from '@nestjs/common';
import { UserType, User } from '../../users/entities/user.entity';
import { Cart } from '../entities/cart.entity';
import { CartCalculationResponseDto } from '../dto/cart-calculation.response.dto';
import { Products } from '../../products/entities/products.entity';
import { CartItem } from '../entities/cart-item.entity';
import { CartItemResponseDto } from '../dto/cart-item-response.dto';

@Injectable()
export class PromotionService {
  calculateBestPrice(user: User, cart: Cart): CartCalculationResponseDto {
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    if (user.type === UserType.VIP) {
      const vipResult = this._calculateVipDiscount(subtotal, cart);
      const threeForTwoResult = this._calculateThreeForTwo(cart);

      if (vipResult.finalTotal < threeForTwoResult.finalTotal) {
        vipResult.recommendationMessage = `A promoção 'VIP Discount (15%)' foi aplicada por ser mais vantajosa. (Economia de $${(threeForTwoResult.finalTotal - vipResult.finalTotal).toFixed(2)})`;
        return vipResult;
      } else {
        threeForTwoResult.recommendationMessage = `A promoção 'Get 3 for the Price of 2' foi aplicada por ser mais vantajosa. (Economia de $${(vipResult.finalTotal - threeForTwoResult.finalTotal).toFixed(2)})`;
        return threeForTwoResult;
      }
    }

    return this._calculateThreeForTwo(cart);
  }

  private _calculateVipDiscount(
    subtotal: number,
    cart: Cart,
  ): CartCalculationResponseDto {
    const discountAmount = subtotal * 0.15;
    const finalTotal = subtotal - discountAmount;

    return {
      items: this._mapCartItemsToResponse(cart.items),
      subtotal: parseFloat(subtotal.toFixed(2)),
      promotionApplied: 'VIP Discount (15%)',
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
    };
  }

  private _calculateThreeForTwo(cart: Cart): CartCalculationResponseDto {
    const allItems: Products[] = [];
    cart.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        allItems.push(item.product);
      }
    });

    if (allItems.length < 3) {
      const subtotal = allItems.reduce(
        (sum, product) => sum + product.price,
        0,
      );
      return {
        items: this._mapCartItemsToResponse(cart.items),
        subtotal: parseFloat(subtotal.toFixed(2)),
        promotionApplied: null,
        discountAmount: 0,
        finalTotal: parseFloat(subtotal.toFixed(2)),
      };
    }

    allItems.sort((a, b) => b.price - a.price);

    let finalTotal = 0;
    let discountAmount = 0;

    for (let i = 0; i < allItems.length; i++) {
      if ((i + 1) % 3 === 0) {
        discountAmount += allItems[i].price;
      } else {
        finalTotal += allItems[i].price;
      }
    }

    const subtotal = allItems.reduce((sum, product) => sum + product.price, 0);

    return {
      items: this._mapCartItemsToResponse(cart.items),
      subtotal: parseFloat(subtotal.toFixed(2)),
      promotionApplied: 'Get 3 for the Price of 2',
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalTotal: parseFloat(finalTotal.toFixed(2)),
    };
  }

  private _mapCartItemsToResponse(items: CartItem[]): CartItemResponseDto[] {
    return items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
  }
}
