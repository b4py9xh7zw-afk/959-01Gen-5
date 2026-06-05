import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import samplePacksRouter from './routes/samplePacks.js'
import ordersRouter from './routes/orders.js'
import downloadsRouter from './routes/downloads.js'

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRouter)
app.use('/api/sample-packs', samplePacksRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/downloads', downloadsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({ error: '服务器内部错误' })
})

export default app
