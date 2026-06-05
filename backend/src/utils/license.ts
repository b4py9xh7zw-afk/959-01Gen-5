import { LicenseTier, LicenseTierInfo } from '../types.js'

export const generateLicenseKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let key = 'SMPL-'
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    if (i < 3) key += '-'
  }
  return key
}

export const calculatePrice = (basePrice: number, tier: LicenseTier): number => {
  const tierInfo = LicenseTierInfo[tier]
  return Math.round(basePrice * tierInfo.multiplier * 100) / 100
}

export const generateOrderNumber = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD${year}${month}${day}${random}`
}

export const canDownloadPack = (purchase: { canDownloadUpdates: boolean; isRefunded: boolean; samplePack: { version: string } }, requestedVersion?: string): { allowed: boolean; reason?: string } => {
  if (purchase.isRefunded) {
    if (requestedVersion && requestedVersion !== purchase.samplePack.version) {
      return {
        allowed: false,
        reason: '该订单已退款，无法下载新版本。您仍可下载购买时的版本。'
      }
    }
    return {
      allowed: true,
      reason: '仅可下载购买时的原始版本'
    }
  }

  if (!purchase.canDownloadUpdates) {
    if (requestedVersion && requestedVersion !== purchase.samplePack.version) {
      return {
        allowed: false,
        reason: '您的下载更新权限已被限制，无法下载新版本。'
      }
    }
  }

  return { allowed: true }
}
