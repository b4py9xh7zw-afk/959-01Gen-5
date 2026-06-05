import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { Order } from './Order.js'
import { LicensePurchase } from './LicensePurchase.js'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', unique: true })
  email: string

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'varchar' })
  passwordHash: string

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => Order, order => order.user)
  orders: Order[]

  @OneToMany(() => LicensePurchase, purchase => purchase.user)
  purchases: LicensePurchase[]
}
