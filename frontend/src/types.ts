export enum LicenseTier {
  PERSONAL = 'personal',
  COMMERCIAL_AD = 'commercial_ad',
  FILM_DISTRIBUTION = 'film_distribution'
}

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REFUNDED = 'refunded'
}

export enum SamplePackCategory {
  DRUMS = 'drums',
  VOCALS = 'vocals',
  AMBIENT = 'ambient'
}

export interface User {
  id: number
  email: string
  name: string
  isAdmin: boolean
}

export interface LicenseTierPricing {
  tier: LicenseTier
  name: string
  description: string
  price: number
  multiplier: number
  features: string[]
}

export interface SamplePack {
  id: number
  name: string
  description: string
  category: SamplePackCategory
  basePrice: number
  producerName: string
  sampleCount: number
  totalDuration: string
  version: string
  tags: string[]
  coverImage: string
  pricing: LicenseTierPricing[]
}

export interface Order {
  id: number
  orderNumber: string
  status: OrderStatus
  samplePackId: number
  samplePackName: string
  licenseTier: LicenseTier
  licenseTierName: string
  amount: number
  createdAt: string
  licenseKey: string
  canDownloadUpdates: boolean
  isRefunded: boolean
  currentVersion: string
  coverImage: string
  refundedAt?: string
  refundReason?: string
}

export interface OrderDetail extends Order {
  licenseTierDescription: string
  licenseTierFeatures: string[]
  paymentMethod: string
  transactionId: string
  producerName: string
}

export interface DownloadItem {
  id: number
  samplePackId: number
  samplePackName: string
  coverImage: string
  producerName: string
  licenseTier: LicenseTier
  licenseTierName: string
  licenseKey: string
  purchasedAt: string
  pricePaid: number
  currentVersion: string
  canDownloadUpdates: boolean
  isRefunded: boolean
  canDownload: boolean
  downloadNote?: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

export const categoryNames: Record<SamplePackCategory, string> = {
  [SamplePackCategory.DRUMS]: '鼓组',
  [SamplePackCategory.VOCALS]: '人声',
  [SamplePackCategory.AMBIENT]: '环境音'
}

export const tierBadgeColors: Record<LicenseTier, string> = {
  [LicenseTier.PERSONAL]: 'bg-green-100 text-green-800',
  [LicenseTier.COMMERCIAL_AD]: 'bg-blue-100 text-blue-800',
  [LicenseTier.FILM_DISTRIBUTION]: 'bg-purple-100 text-purple-800'
}
