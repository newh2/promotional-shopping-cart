import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddItemCartDto } from './dto/add-item-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  addItemToCart(
    @Body() addItemDto: AddItemCartDto,
    @Query('cartId') cartId?: string,
  ) {
    return this.cartService.addItem(addItemDto, cartId);
  }

  @Delete(':cartId/items/:itemId')
  removeItemFromCart(
    @Param('cartId') cartId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeItem(cartId, itemId);
  }

  @Get(':cartId/:userId/total')
  getCartTotal(
    @Param('cartId') cartId: string,
    @Param('userId') userId: string,
  ) {
    return this.cartService.getCartTotal(cartId, userId);
  }
}
