import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('user_addresses')
export class UserAddress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100 })
  label!: string; // Home, Office, etc.

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

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text' })
  fullAddress!: string; // Keep for quick display/backward compatibility

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
