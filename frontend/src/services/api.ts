import axios from 'axios'
import { SamplePack, Order, OrderDetail, DownloadItem, User } from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),
  register: (email: string, name: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, name, password }),
  me: () =>
    api.get<{ user: User }>('/auth/me')
}

export const samplePacksAPI = {
  list: (category?: string, search?: string) => {
    const params = new URLSearchParams()
    if (category) params.append('category', category)
    if (search) params.append('search', search)
    return api.get<{ packs: SamplePack[] }>(`/sample-packs?${params.toString()}`)
  },
  get: (id: number) =>
    api.get<{ pack: SamplePack }>(`/sample-packs/${id}`)
}

export const ordersAPI = {
  list: () =>
    api.get<{ orders: Order[] }>('/orders'),
  get: (id: number) =>
    api.get<{ order: OrderDetail }>(`/orders/${id}`),
  create: (samplePackId: number, licenseTier: string) =>
    api.post<{ order: Order }>('/orders', { samplePackId, licenseTier }),
  refund: (id: number, reason: string) =>
    api.post(`/orders/${id}/refund`, { reason })
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

const getFilenameFromContentDisposition = (header: string | null, defaultName: string) => {
  if (header) {
    const match = header.match(/filename="?([^"]+)"?/)
    if (match && match[1]) {
      return match[1]
    }
  }
  return defaultName
}

export const downloadsAPI = {
  list: () =>
    api.get<{ downloads: DownloadItem[] }>('/downloads'),
  downloadPack: async (purchaseId: number, version?: string) => {
    try {
      const url = version 
        ? `/downloads/${purchaseId}/sample-pack?version=${version}`
        : `/downloads/${purchaseId}/sample-pack`
      const response = await api.get(url, {
        responseType: 'blob'
      })
      const filename = getFilenameFromContentDisposition(
        response.headers['content-disposition'],
        `sample-pack-${purchaseId}.zip`
      )
      triggerDownload(response.data, filename)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  },
  downloadLicense: async (purchaseId: number) => {
    try {
      const response = await api.get(`/downloads/${purchaseId}/license-certificate`, {
        responseType: 'blob'
      })
      const filename = getFilenameFromContentDisposition(
        response.headers['content-disposition'],
        `license-certificate-${purchaseId}.pdf`
      )
      triggerDownload(response.data, filename)
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  },
  getLicenseDetails: (purchaseId: number) =>
    api.get(`/downloads/${purchaseId}/license-details`)
}

export default api
