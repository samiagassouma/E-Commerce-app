import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { assistants } from './assistants.entity';

@Entity('payment')
@Unique(['transactionId'])
export class Payment {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
    name: 'idPayment',
  })
  idPayment: number;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3, default: 'TND' })
  currency: string;

  @Column({ length: 50, nullable: true })
  paymentMethod: string;

  @Column({ length: 20, default: 'pending' })
  paymentStatus: string;

  @Column({ length: 100, nullable: true, unique: true })
  transactionId: string;

  @Column({ length: 20, nullable: true })
  card_number: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  paymentDate: Date;

  @Column({ length: 50, nullable: true })
  subscriptionPlan: string;

  @Column({ type: 'date', nullable: true })
  billingCycleStart: Date;

  @Column({ type: 'date', nullable: true })
  billingCycleEnd: Date;

  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

    @ManyToOne(() => User, user => user.payments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => assistants, assistant => assistant.payments, { onDelete: 'CASCADE' })
  assistant: assistants;

}
