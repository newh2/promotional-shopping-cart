import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddItemCartDto {
  @IsUUID()
  @IsNotEmpty({ message: 'O ID do produto não pode ser vazio.' })
  productId: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty({ message: 'A quantidade não pode ser menor que 1.' })
  quantity: number;
}
