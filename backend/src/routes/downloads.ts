import { Router } from 'express'
import { AppDataSource } from '../data-source.js'
import { LicensePurchase } from '../entities/LicensePurchase.js'
import { LicenseTierInfo } from '../types.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { canDownloadPack } from '../utils/license.js'
import { generateLicenseCertificate, generateLicenseFileName } from '../services/licensePdfService.js'

const router = Router()

router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    const purchases = await purchaseRepo.find({
      where: { user: { id: req.user!.id } },
      relations: ['samplePack'],
      order: { createdAt: 'DESC' }
    })
    
    const downloads = purchases.map(purchase => {
      const downloadCheck = canDownloadPack(purchase)
      return {
        id: purchase.id,
        samplePackId: purchase.samplePack.id,
        samplePackName: purchase.samplePack.name,
        coverImage: purchase.samplePack.coverImage,
        producerName: purchase.samplePack.producerName,
        licenseTier: purchase.licenseTier,
        licenseTierName: LicenseTierInfo[purchase.licenseTier].name,
        licenseKey: purchase.licenseKey,
        purchasedAt: purchase.createdAt,
        pricePaid: purchase.pricePaid,
        currentVersion: purchase.samplePack.version,
        canDownloadUpdates: purchase.canDownloadUpdates,
        isRefunded: purchase.isRefunded,
        canDownload: downloadCheck.allowed,
        downloadNote: downloadCheck.reason
      }
    })
    
    res.json({ downloads })
  } catch (error) {
    res.status(500).json({ error: '获取下载列表失败' })
  }
})

router.get('/:purchaseId/sample-pack', authenticate, async (req: AuthRequest, res) => {
  try {
    const { purchaseId } = req.params
    const { version } = req.query
    
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    const purchase = await purchaseRepo.findOne({
      where: { id: parseInt(purchaseId), user: { id: req.user!.id } },
      relations: ['samplePack', 'user']
    })
    
    if (!purchase) {
      return res.status(404).json({ error: '购买记录不存在' })
    }
    
    const downloadCheck = canDownloadPack(purchase, version as string)
    if (!downloadCheck.allowed) {
      return res.status(403).json({ error: downloadCheck.reason })
    }
    
    const mockZipContent = Buffer.from(`
===== 采样工坊 - 采样包下载 =====
采样包名称: ${purchase.samplePack.name}
版本: ${version || purchase.samplePack.version}
授权类型: ${LicenseTierInfo[purchase.licenseTier].name}
授权编号: ${purchase.licenseKey}
授权用户: ${purchase.user.name} (${purchase.user.email})
购买日期: ${new Date(purchase.createdAt).toLocaleDateString('zh-CN')}
================================

本下载包包含:
1. 完整音频采样文件 (WAV 格式)
2. 授权证明书 (PDF)
3. 使用说明文档

注意: 请严格遵守授权协议使用本采样包。
    `)
    
    const fileName = `${purchase.samplePack.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_v${version || purchase.samplePack.version}.zip`
    
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    res.send(mockZipContent)
  } catch (error) {
    res.status(500).json({ error: '下载采样包失败' })
  }
})

router.get('/:purchaseId/license-certificate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { purchaseId } = req.params
    
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    const purchase = await purchaseRepo.findOne({
      where: { id: parseInt(purchaseId), user: { id: req.user!.id } },
      relations: ['samplePack', 'user']
    })
    
    if (!purchase) {
      return res.status(404).json({ error: '购买记录不存在' })
    }
    
    const pdfBuffer = await generateLicenseCertificate(
      purchase,
      purchase.user.name,
      purchase.user.email
    )
    
    const fileName = generateLicenseFileName(purchase)
    
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
    res.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation error:', error)
    res.status(500).json({ error: '生成授权证明书失败' })
  }
})

router.get('/:purchaseId/license-details', authenticate, async (req: AuthRequest, res) => {
  try {
    const { purchaseId } = req.params
    
    const purchaseRepo = AppDataSource.getRepository(LicensePurchase)
    const purchase = await purchaseRepo.findOne({
      where: { id: parseInt(purchaseId), user: { id: req.user!.id } },
      relations: ['samplePack']
    })
    
    if (!purchase) {
      return res.status(404).json({ error: '购买记录不存在' })
    }
    
    const downloadCheck = canDownloadPack(purchase)
    
    res.json({
      license: {
        id: purchase.id,
        licenseKey: purchase.licenseKey,
        licenseTier: purchase.licenseTier,
        licenseTierName: LicenseTierInfo[purchase.licenseTier].name,
        licenseTierDescription: LicenseTierInfo[purchase.licenseTier].description,
        licenseTierFeatures: LicenseTierInfo[purchase.licenseTier].features,
        pricePaid: purchase.pricePaid,
        purchasedAt: purchase.createdAt,
        canDownloadUpdates: purchase.canDownloadUpdates,
        isRefunded: purchase.isRefunded,
        refundedAt: purchase.refundedAt,
        samplePack: {
          id: purchase.samplePack.id,
          name: purchase.samplePack.name,
          version: purchase.samplePack.version,
          producerName: purchase.samplePack.producerName,
          category: purchase.samplePack.category
        },
        canDownload: downloadCheck.allowed,
        downloadNote: downloadCheck.reason
      }
    })
  } catch (error) {
    res.status(500).json({ error: '获取授权详情失败' })
  }
})

export default router
