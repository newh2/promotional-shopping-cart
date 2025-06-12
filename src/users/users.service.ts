import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserType } from './entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  [x: string]: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
  ) {}
  async onModuleInit() {
    const usersExist = await this.userRepository.count();
    if (usersExist === 0) {
      console.log('Nenhum usuário encontrado. Criando usuários padrão...');
      await this.create({
        name: 'Usuário Padrão Comum',
        type: UserType.COMMON,
      });
      await this.create({ name: 'Usuário Padrão VIP', type: UserType.VIP });
      console.log('Usuários padrão criados com sucesso.');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(newUser);

    const newCart = this.cartRepository.create({ user: savedUser });
    await this.cartRepository.save(newCart);

    return this.findOne(savedUser.id);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    const user = await this.userRepository.find();
    if (!user || user.length === 0) {
      throw new NotFoundException(`Users not found`);
    }
    return user;
  }
}
