import { Router } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { AppDataSource } from '../data-source.js'
import { User } from '../entities/User.js'
import { authenticate, generateToken, AuthRequest } from '../middleware/auth.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6)
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = registerSchema.parse(req.body)
    
    const userRepo = AppDataSource.getRepository(User)
    const existingUser = await userRepo.findOne({ where: { email } })
    
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' })
    }
    
    const passwordHash = await bcrypt.hash(password, 10)
    const user = userRepo.create({ email, name, passwordHash })
    await userRepo.save(user)
    
    const token = generateToken(user.id)
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: '注册失败' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { email } })
    
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' })
    }
    
    const token = generateToken(user.id)
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    res.status(500).json({ error: '登录失败' })
  }
})

router.get('/me', authenticate, async (req: AuthRequest, res) => {
  if (!req.user) return res.status(401).json({ error: '未登录' })
  
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      isAdmin: req.user.isAdmin
    }
  })
})

export default router
