import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import { Cart } from './entities/cart.entity';
import { CartCalculationResponseDto } from './dto/cart-calculation.response.dto';
import { CartItem } from './entities/cart-item.entity';
import { ProductsService } from '../products/products.service';
import { UsersService } from '../users/users.service';
import { PromotionService } from './promotion/promotion.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
    private readonly promotionService: PromotionService,
  ) {}

  async addItem(itemDto: AddItemCartDto, cartId?: string): Promise<Cart> {
    let cart: Cart;

    if (cartId) {
      cart = await this.cartRepository.findOne({ where: { id: cartId } });
      if (!cart) {
        throw new NotFoundException(
          `Carrinho com ID ${cartId} não encontrado.`,
        );
      }
    } else {
      cart = this.cartRepository.create({ items: [] });
      await this.cartRepository.save(cart);
    }

    const product = await this.productsService.findOne(itemDto.productId);
    if (!product) {
      throw new NotFoundException(
        `Produto com ID ${itemDto.productId} não encontrado.`,
      );
    }

    const existingItem = cart.items.find(
      (item) => item.product.id === itemDto.productId,
    );

    if (existingItem) {
      existingItem.quantity += itemDto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        cart: cart,
        product: product,
        quantity: itemDto.quantity,
      });
      await this.cartItemRepository.save(newItem);
    }

    return this.cartRepository.findOne({ where: { id: cart.id } });
  }

  async getCartTotal(
    cartId: string,
    userId: string,
  ): Promise<CartCalculationResponseDto> {
    const cart = await this.cartRepository.findOne({ where: { id: cartId } });
    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cartId} não encontrado.`);
    }

    const user = await this.usersService.findOne(userId);

    if (!cart.user || cart.user.id !== userId) {
      cart.user = user;
      await this.cartRepository.save(cart);
    }

    return this.promotionService.calculateBestPrice(user, cart);
  }

  async removeItem(cartId: string, itemId: string): Promise<Cart | string> {
    const itemToRemove = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cartId } },
    });
    if (!itemToRemove) {
      throw new NotFoundException(
        `Item com ID ${itemId} não encontrado no carrinho ${cartId}.`,
      );
    }

    await this.cartItemRepository.remove(itemToRemove);
    return (
      HttpStatus.OK, `Item com ID ${itemId} removido do carrinho ${cartId}.`
    );
  }

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      throw new NotFoundException(`Carrinho com ID ${cartId} não encontrado.`);
    }
    return cart;
  }

  async getAllCarts(): Promise<Cart[]> {
    const carts = await this.cartRepository.find({
      relations: ['items', 'items.product'],
    });
    if (!carts || carts.length === 0) {
      throw new NotFoundException('Nenhum carrinho encontrado.');
    }
    return carts;
  }
}
