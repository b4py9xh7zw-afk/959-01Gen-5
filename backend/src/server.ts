import app from './app.js'
import { AppDataSource } from './data-source.js'

const PORT = process.env.PORT || 3001

const startServer = async () => {
  try {
    await AppDataSource.initialize()
    console.log('数据库连接成功')
    
    app.listen(PORT, () => {
      console.log(`服务器运行在 http://localhost:${PORT}`)
      console.log(`健康检查: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error('服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()
