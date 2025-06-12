import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';
import { CartItem } from '../entities/cart-item.entity';

export class RemoveItemCartDto {
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do produto não pode ser vazio.' })
  productId: string;

  @IsInt()
  quantity: number;

  @IsNotEmpty({ message: 'Deve-se ter ao menos um item no carrinho.' })
  items: CartItem[];
}
