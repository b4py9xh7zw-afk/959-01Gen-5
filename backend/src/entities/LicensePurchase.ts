import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { LicenseTier } from '../types.js'
import { User } from './User.js'
import { SamplePack } from './SamplePack.js'
import { Order } from './Order.js'

@Entity()
export class LicensePurchase {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'simple-enum',
    enum: LicenseTier
  })
  licenseTier: LicenseTier

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePaid: number

  @Column({ type: 'varchar', unique: true })
  licenseKey: string

  @Column({ type: 'boolean', default: true })
  canDownloadUpdates: boolean

  @Column({ type: 'boolean', default: false })
  isRefunded: boolean

  @Column({ type: 'datetime', nullable: true })
  refundedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @ManyToOne(() => User, user => user.purchases)
  user: User

  @ManyToOne(() => SamplePack, pack => pack.purchases)
  samplePack: SamplePack

  @OneToOne(() => Order, order => order.licensePurchase)
  @JoinColumn()
  order: Order
}
