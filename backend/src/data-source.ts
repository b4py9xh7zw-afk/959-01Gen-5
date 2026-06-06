import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV !== 'production'
const entityExt = isDev ? 'ts' : 'js'

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: path.join(__dirname, '../sample_store.sqlite'),
  synchronize: true,
  logging: false,
  entities: [path.join(__dirname, `entities/**/*.${entityExt}`)],
  migrations: [],
  subscribers: [],
})
