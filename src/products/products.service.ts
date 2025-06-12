import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/products.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
  ) {}

  async onModuleInit() {
    const productsExist = await this.productRepository.find();
    if (productsExist.length === 0) {
      await this.productRepository.save([
        { name: 'T-shirt', price: 35.99 },
        { name: 'Jeans', price: 65.5 },
        { name: 'Dress', price: 80.75 },
      ]);
    }
  }
  findAll(): Promise<Products[]> {
    return this.productRepository.find();
  }

  findOne(id: string): Promise<Products> {
    return this.productRepository.findOneBy({ id });
  }
}
