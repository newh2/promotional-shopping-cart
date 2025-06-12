import { Cart } from '../../cart/entities/cart.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum UserType {
  COMMON = 'COMMON',
  VIP = 'VIP',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({
    type: 'text',
    enum: UserType,
    default: UserType.COMMON,
  })
  type: UserType;

  @OneToMany(() => Cart, (cart) => cart.user)
  cart: Cart[];
}
