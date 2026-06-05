import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne } from 'typeorm'
import { OrderStatus, LicenseTier } from '../types.js'
import { User } from './User.js'
import { LicensePurchase } from './LicensePurchase.js'

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', unique: true })
  orderNumber: string

  @Column({
    type: 'simple-enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus

  @Column({ type: 'int' })
  samplePackId: number

  @Column({ type: 'varchar' })
  samplePackName: string

  @Column({
    type: 'simple-enum',
    enum: LicenseTier
  })
  licenseTier: LicenseTier

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number

  @Column({ type: 'varchar', nullable: true })
  paymentMethod: string

  @Column({ type: 'varchar', nullable: true })
  transactionId: string

  @Column({ type: 'text', nullable: true })
  refundReason: string

  @Column({ type: 'datetime', nullable: true })
  refundedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, user => user.orders)
  user: User

  @OneToOne(() => LicensePurchase, purchase => purchase.order, { nullable: true })
  licensePurchase: LicensePurchase
}
