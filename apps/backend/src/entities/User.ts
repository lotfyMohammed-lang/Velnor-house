import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Project } from './Project';
import { UserAddress } from './UserAddress';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId!: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  facebookId!: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  twitterId!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender!: string | null;

  @Column({ type: 'date', nullable: true })
  birthDate!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'reset_password_token_hash' })
  resetPasswordTokenHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'reset_password_expires_at' })
  resetPasswordExpiresAt!: Date | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  resetOtp!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetOtpExpiresAt!: Date | null;

  @OneToMany(() => Project, (project) => project.user)
  projects!: Project[];

  @OneToMany(() => UserAddress, (address) => address.user)
  addresses!: UserAddress[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
