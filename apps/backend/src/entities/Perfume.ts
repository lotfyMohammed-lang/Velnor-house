import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface PerfumeSize {
  sizeMl: number;
  costPrice: number;
  price: number;
  stock: number;
}

@Entity('perfumes')
export class Perfume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  brand!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 10, default: 'EGP' })
  currency!: string;

  @Column({ type: 'jsonb', default: [] })
  sizes!: PerfumeSize[];

  @Column({ type: 'varchar', length: 50, default: 'perfume' })
  type!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, any>;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'varchar', length: 500 })
  imageUrl!: string;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'boolean', default: false })
  bestseller!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}