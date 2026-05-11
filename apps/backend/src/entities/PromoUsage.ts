import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { PromoCode } from './PromoCode';
import { Order } from './Order';

@Entity('promo_code_usages')
export class PromoUsage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => PromoCode)
  @JoinColumn({ name: 'promo_code_id' })
  promoCode!: PromoCode;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @CreateDateColumn({ name: 'used_at' })
  usedAt!: Date;
}
