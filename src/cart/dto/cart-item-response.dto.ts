export class CartItemResponseDto {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}
export class CartCalculationResponseDto {
  items: CartItemResponseDto[];
  subtotal: number;
  promotionApplied: string | null;
  discountAmount: number;
  finalTotal: number;
  recommendationMessage?: string | null;
}
