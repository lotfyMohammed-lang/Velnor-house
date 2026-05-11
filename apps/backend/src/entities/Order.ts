import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User)
  user!: User;

  @Column({ type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  // Structured Address (Nullable for backward compatibility)
  @Column({ type: 'varchar', length: 100, nullable: true })
  governorate!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  area!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buildingNumber!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  apartmentNumber!: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  floor!: string | null;

  @Column({ type: 'text', nullable: true })
  landmark!: string | null;

  @Column({ type: 'text', nullable: true })
  deliveryNotes!: string | null;

  @Column({ type: 'text' })
  address!: string; // Formatted full address for quick display

  @Column({ type: 'varchar', length: 50 })
  paymentMethod!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  appliedPromoCode!: string | null;

  @Column({ type: 'jsonb' })
  items!: {
    productId: string;
    name: string;
    brand: string;
    price: number;
    sizeMl: number;
    quantity: number;
    image: string;
  }[];

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
