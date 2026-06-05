import { Router, Request } from 'express'
import { z } from 'zod'
import { AppDataSource } from '../data-source.js'
import { SamplePack } from '../entities/SamplePack.js'
import { SamplePackCategory, LicenseTier, LicenseTierInfo } from '../types.js'
import { calculatePrice } from '../utils/license.js'
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js'

const router = Router()

const createPackSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.nativeEnum(SamplePackCategory),
  basePrice: z.number().positive(),
  producerName: z.string().min(1),
  sampleCount: z.number().int().positive(),
  totalDuration: z.string().min(1),
  version: z.string().min(1),
  tags: z.array(z.string()).optional(),
  coverImage: z.string().optional()
})

router.get('/', async (req: Request, res) => {
  try {
    const { category, search } = req.query
    const packRepo = AppDataSource.getRepository(SamplePack)
    
    let query = packRepo.createQueryBuilder('pack')
      .where('pack.isActive = :active', { active: true })
    
    if (category && Object.values(SamplePackCategory).includes(category as SamplePackCategory)) {
      query = query.andWhere('pack.category = :category', { category })
    }
    
    if (search) {
      query = query.andWhere(
        'pack.name LIKE :search OR pack.description LIKE :search OR pack.producerName LIKE :search',
        { search: `%${search}%` }
      )
    }
    
    const packs = await query.getMany()
    
    const packsWithPricing = packs.map(pack => ({
      ...pack,
      pricing: Object.values(LicenseTier).map(tier => ({
        tier,
        name: LicenseTierInfo[tier].name,
        description: LicenseTierInfo[tier].description,
        price: calculatePrice(pack.basePrice, tier),
        multiplier: LicenseTierInfo[tier].multiplier,
        features: LicenseTierInfo[tier].features
      }))
    }))
    
    res.json({ packs: packsWithPricing })
  } catch (error) {
    res.status(500).json({ error: '获取采样包列表失败' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const packRepo = AppDataSource.getRepository(SamplePack)
    const pack = await packRepo.findOne({ where: { id: parseInt(id), isActive: true } })
    
    if (!pack) {
      return res.status(404).json({ error: '采样包不存在' })
    }
    
    const packWithPricing = {
      ...pack,
      pricing: Object.values(LicenseTier).map(tier => ({
        tier,
        name: LicenseTierInfo[tier].name,
        description: LicenseTierInfo[tier].description,
        price: calculatePrice(pack.basePrice, tier),
        multiplier: LicenseTierInfo[tier].multiplier,
        features: LicenseTierInfo[tier].features
      }))
    }
    
    res.json({ pack: packWithPricing })
  } catch (error) {
    res.status(500).json({ error: '获取采样包详情失败' })
  }
})

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const data = createPackSchema.parse(req.body)
    const packRepo = AppDataSource.getRepository(SamplePack)
    
    const pack = packRepo.create(data)
    await packRepo.save(pack)
    
    res.status(201).json({ pack })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: '创建采样包失败' })
  }
})

router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const data = createPackSchema.partial().parse(req.body)
    const packRepo = AppDataSource.getRepository(SamplePack)
    
    const pack = await packRepo.findOne({ where: { id: parseInt(id) } })
    if (!pack) {
      return res.status(404).json({ error: '采样包不存在' })
    }
    
    packRepo.merge(pack, data)
    await packRepo.save(pack)
    
    res.json({ pack })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: '更新采样包失败' })
  }
})

export default router
