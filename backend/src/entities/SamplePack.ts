import 'reflect-metadata'
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { SamplePackCategory } from '../types.js'
import { LicensePurchase } from './LicensePurchase.js'

@Entity()
export class SamplePack {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar' })
  name: string

  @Column({ type: 'text' })
  description: string

  @Column({
    type: 'simple-enum',
    enum: SamplePackCategory
  })
  category: SamplePackCategory

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number

  @Column({ type: 'varchar' })
  producerName: string

  @Column({ type: 'int' })
  sampleCount: number

  @Column({ type: 'varchar' })
  totalDuration: string

  @Column({ type: 'varchar' })
  version: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]

  @Column({ type: 'simple-array', nullable: true })
  demoUrls: string[]

  @Column({ type: 'varchar', nullable: true })
  coverImage: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => LicensePurchase, purchase => purchase.samplePack)
  purchases: LicensePurchase[]
}
