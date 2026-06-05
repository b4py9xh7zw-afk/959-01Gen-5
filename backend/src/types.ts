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

export const LicenseTierInfo: Record<LicenseTier, {
  name: string
  description: string
  multiplier: number
  features: string[]
}> = {
  [LicenseTier.PERSONAL]: {
    name: '个人授权',
    description: '适用于个人非商业项目',
    multiplier: 1,
    features: [
      '个人学习和非商业项目使用',
      '不得用于商业广告',
      '不得用于影视发行',
      '需标注原作者'
    ]
  },
  [LicenseTier.COMMERCIAL_AD]: {
    name: '商业广告授权',
    description: '适用于广告、品牌推广等商业用途',
    multiplier: 3,
    features: [
      '可用于商业广告和品牌推广',
      '可用于社交媒体营销',
      '最高1000万次展示量',
      '无需标注原作者'
    ]
  },
  [LicenseTier.FILM_DISTRIBUTION]: {
    name: '影视发行授权',
    description: '适用于电影、剧集等公开发行作品',
    multiplier: 10,
    features: [
      '可用于电影、剧集发行',
      '可用于流媒体平台',
      '无展示量限制',
      '全球范围授权',
      '可进行二次创作改编'
    ]
  }
}
