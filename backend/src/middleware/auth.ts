import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppDataSource } from '../data-source.js'
import { User } from '../entities/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'samplestore-dev-secret-2024'

export interface AuthRequest extends Request {
  user?: User
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未提供认证令牌' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number }
    
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { id: decoded.userId } })
    
    if (!user) {
      return res.status(401).json({ error: '用户不存在' })
    }
    
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ error: '无效的认证令牌' })
  }
}

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: '需要管理员权限' })
  }
  next()
}

export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' })
}
