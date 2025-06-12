import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Products } from './entities/products.entity';

@Controller('products')
export class ProductsController {
  productRepository: any;
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  findOne(id: string): Promise<Products> {
    return this.productRepository.findOneBy({ id });
  }
}
