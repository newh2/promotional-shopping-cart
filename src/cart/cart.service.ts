import { Injectable } from '@nestjs/common';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import type { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly repository: Repository<Cart>,
  ) {}

  create(createCart: AddItemCartDto) {
    const cart = this.repository.create(createCart);
    return this.repository.save(cart);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOneBy({ id });
  }

  async update(id: string, dto: AddItemCartDto) {
    const cart = await this.repository.findOneBy({ id });
    if (!cart) return null;
    this.repository.merge(cart, dto);
    return this.repository.save(cart);
  }

  async remove(id: string) {
    const cart = await this.repository.findOneBy({ id });
    if (!cart) return null;
    return this.repository.remove(cart);
  }
}
