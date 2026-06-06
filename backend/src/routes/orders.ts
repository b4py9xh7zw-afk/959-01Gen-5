import { Router } from 'express'
import { z } from 'zod'
import { AppDataSource } from '../data-source.js'
import { Order } from '../entities/Order.js'
import { LicensePurchase } from '../entities/LicensePurchase.js'
import { SamplePack } from '../entities/SamplePack.js'
import { LicenseTier, OrderStatus, LicenseTierInfo } from '../types.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { generateOrderNumber, generateLicenseKey, calculatePrice } from '../utils/license.js'

const router = Router()

const createOrderSchema = z.object({
  samplePackId: z.number().int().positive(),
  licenseTier: z.nativeEnum(LicenseTier),
  paymentMethod: z.string().optional()
})

const refundSchema = z.object({
  reason: z.string().min(1)
})

router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { samplePackId, licenseTier, paymentMethod } = createOrderSchema.parse(req.body)
    
    const packRepo = AppDataSource.getRepository(SamplePack)
    const pack = await packRepo.findOne({ where: { id: samplePackId, isActive: true } })
    
    if (!pack) {
      return res.status(404).json({ error: '采样包不存在' })
    }
    
    const orderRepo = AppDataSource.getRepository(Order)
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    
    const existingPurchase = await purchaseRepo.findOne({
      where: {
        user: { id: req.user!.id },
        samplePack: { id: samplePackId },
        licenseTier: licenseTier,
        isRefunded: false
      }
    })
    
    if (existingPurchase) {
      return res.status(400).json({ error: '您已购买过该采样包的此授权类型' })
    }
    
    const price = calculatePrice(pack.basePrice, licenseTier)
    const orderNumber = generateOrderNumber()
    
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      const order = transactionalEntityManager.create(Order, {
        orderNumber,
        status: OrderStatus.COMPLETED,
        samplePackId: pack.id,
        samplePackName: pack.name,
        licenseTier,
        amount: price,
        paymentMethod: paymentMethod || 'stripe',
        transactionId: `txn_${Date.now()}`,
        user: req.user!
      })
      
      await transactionalEntityManager.save(order)
      
      const licenseKey = generateLicenseKey()
      const purchase = transactionalEntityManager.create(LicensePurchase, {
        licenseTier,
        pricePaid: price,
        licenseKey,
        user: req.user!,
        samplePack: pack,
        order
      })
      
      await transactionalEntityManager.save(purchase)
      
      order.licensePurchase = purchase
      await transactionalEntityManager.save(order)
      
      res.status(201).json({
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          samplePackId: order.samplePackId,
          samplePackName: order.samplePackName,
          licenseTier: order.licenseTier,
          licenseTierName: LicenseTierInfo[order.licenseTier].name,
          amount: order.amount,
          licenseKey,
          createdAt: order.createdAt
        }
      })
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('Order creation error:', error)
    res.status(500).json({ error: '创建订单失败' })
  }
})

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const orderRepo = AppDataSource.getRepository(Order)
    const orders = await orderRepo.find({
      where: { user: { id: req.user!.id } },
      relations: ['licensePurchase', 'licensePurchase.samplePack'],
      order: { createdAt: 'DESC' }
    })
    
    const ordersWithDetails = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      samplePackId: order.samplePackId,
      samplePackName: order.samplePackName,
      licenseTier: order.licenseTier,
      licenseTierName: LicenseTierInfo[order.licenseTier].name,
      amount: order.amount,
      createdAt: order.createdAt,
      refundedAt: order.refundedAt,
      refundReason: order.refundReason,
      licensePurchaseId: order.licensePurchase?.id,
      licenseKey: order.licensePurchase?.licenseKey,
      canDownloadUpdates: order.licensePurchase?.canDownloadUpdates,
      isRefunded: order.licensePurchase?.isRefunded,
      currentVersion: order.licensePurchase?.samplePack.version,
      coverImage: order.licensePurchase?.samplePack.coverImage
    }))
    
    res.json({ orders: ordersWithDetails })
  } catch (error) {
    res.status(500).json({ error: '获取订单列表失败' })
  }
})

router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const orderRepo = AppDataSource.getRepository(Order)
    const order = await orderRepo.findOne({
      where: { id: parseInt(id), user: { id: req.user!.id } },
      relations: ['licensePurchase', 'licensePurchase.samplePack']
    })
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }
    
    const orderDetail = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      samplePackId: order.samplePackId,
      samplePackName: order.samplePackName,
      licenseTier: order.licenseTier,
      licenseTierName: LicenseTierInfo[order.licenseTier].name,
      licenseTierDescription: LicenseTierInfo[order.licenseTier].description,
      licenseTierFeatures: LicenseTierInfo[order.licenseTier].features,
      amount: order.amount,
      paymentMethod: order.paymentMethod,
      transactionId: order.transactionId,
      createdAt: order.createdAt,
      refundedAt: order.refundedAt,
      refundReason: order.refundReason,
      licensePurchaseId: order.licensePurchase?.id,
      licenseKey: order.licensePurchase?.licenseKey,
      canDownloadUpdates: order.licensePurchase?.canDownloadUpdates,
      isRefunded: order.licensePurchase?.isRefunded,
      currentVersion: order.licensePurchase?.samplePack.version,
      coverImage: order.licensePurchase?.samplePack.coverImage,
      producerName: order.licensePurchase?.samplePack.producerName
    }
    
    res.json({ order: orderDetail })
  } catch (error) {
    res.status(500).json({ error: '获取订单详情失败' })
  }
})

router.post('/:id/refund', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { reason } = refundSchema.parse(req.body)
    
    const orderRepo = AppDataSource.getRepository(Order)
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    
    const order = await orderRepo.findOne({
      where: { id: parseInt(id), user: { id: req.user!.id } },
      relations: ['licensePurchase']
    })
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' })
    }
    
    if (order.status === OrderStatus.REFUNDED) {
      return res.status(400).json({ error: '该订单已退款' })
    }
    
    const daysSincePurchase = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePurchase > 30) {
      return res.status(400).json({ error: '超过30天退款期限' })
    }
    
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      order.status = OrderStatus.REFUNDED
      order.refundReason = reason
      order.refundedAt = new Date()
      await transactionalEntityManager.save(order)
      
      if (order.licensePurchase) {
        const purchase = await purchaseRepo.findOne({
          where: { id: order.licensePurchase.id }
        })
        if (purchase) {
          purchase.isRefunded = true
          purchase.canDownloadUpdates = false
          purchase.refundedAt = new Date()
          await transactionalEntityManager.save(purchase)
        }
      }
    })
    
    res.json({
      message: '退款申请已处理成功。购买记录已保留，但您将无法下载该采样包的未来更新版本。',
      order: {
        id: order.id,
        status: order.status,
        refundedAt: order.refundedAt,
        canDownloadUpdates: false,
        isRefunded: true
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: '退款处理失败' })
  }
})

export default router
