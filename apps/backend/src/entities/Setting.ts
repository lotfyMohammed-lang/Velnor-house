import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id!: number;

  // WhatsApp Settings
  @Column({ default: '201507997888' })
  whatsappNumber!: string;

  @Column({ type: 'text', default: 'Hello! I want to ask about your perfumes.' })
  whatsappDefaultMessage!: string;

  @Column({ default: 'تواصل معنا' })
  whatsappLabelAr!: string;

  @Column({ default: 'Chat with us' })
  whatsappLabelEn!: string;

  @Column({ default: 'left', type: 'enum', enum: ['left', 'right'] })
  whatsappPosition!: 'left' | 'right';

  @Column({ default: true })
  whatsappEnabled!: boolean;

  // Email Notification Settings
  @Column({ default: true })
  emailEnabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  notificationEmail!: string;

  // Telegram Notification Settings
  @Column({ default: true })
  telegramEnabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  telegramBotToken!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  telegramChatId!: string;

  // Admin Dashboard Settings
  @Column({ default: true })
  adminDashboardEnabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
