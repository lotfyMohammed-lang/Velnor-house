import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Order } from './Order';

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'order_id' })
  orderId!: string;

  @Column({ type: 'varchar', length: 255, name: 'product_id' })
  productId!: string;

  @Column({ type: 'varchar', length: 255, name: 'product_name' })
  productName!: string;

  @Column({ type: 'integer', nullable: true })
  sizeMl!: number | null;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
