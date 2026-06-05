import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { samplePacksAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { SamplePack, LicenseTier, LicenseTierPricing, categoryNames, tierBadgeColors } from '../types'

const PackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [pack, setPack] = useState<SamplePack | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState<LicenseTier>(LicenseTier.PERSONAL)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      loadPack()
    }
  }, [id])

  const loadPack = async () => {
    try {
      const res = await samplePacksAPI.get(parseInt(id!))
      setPack(res.data.pack)
    } catch (error) {
      console.error('Failed to load pack:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/pack/${id}` } })
      return
    }

    setPurchasing(true)
    setError('')

    try {
      const res = await ordersAPI.create(parseInt(id!), selectedTier)
      navigate(`/orders/${res.data.order.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || '购买失败，请重试')
    } finally {
      setPurchasing(false)
    }
  }

  const getSelectedPricing = (): LicenseTierPricing | undefined => {
    return pack?.pricing.find(p => p.tier === selectedTier)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!pack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">采样包不存在</p>
          <Link to="/" className="btn-primary">返回商店</Link>
        </div>
      </div>
    )
  }

  const selectedPricing = getSelectedPricing()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">商店</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">{pack.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
              <div className="aspect-video bg-gray-100">
                <img
                  src={pack.coverImage}
                  alt={pack.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`status-badge ${tierBadgeColors[LicenseTier.PERSONAL]}`}>
                    {categoryNames[pack.category]}
                  </span>
                  <span className="status-badge bg-gray-100 text-gray-800">
                    v{pack.version}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pack.name}</h1>
                <p className="text-gray-600 mb-4">by {pack.producerName}</p>
                <p className="text-gray-700 leading-relaxed">{pack.description}</p>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {pack.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{pack.sampleCount}</div>
                    <div className="text-sm text-gray-500">采样数量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{pack.totalDuration}</div>
                    <div className="text-sm text-gray-500">总时长</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">v{pack.version}</div>
                    <div className="text-sm text-gray-500">当前版本</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-1">选择授权类型</h2>
                <p className="text-sm text-gray-500">根据您的使用场景选择合适的授权</p>
              </div>

              <div className="p-6 space-y-4">
                {pack.pricing.map((pricing) => (
                  <div
                    key={pricing.tier}
                    onClick={() => setSelectedTier(pricing.tier)}
                    className={`tier-card ${selectedTier === pricing.tier ? 'selected' : 'border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{pricing.name}</h3>
                        <p className="text-sm text-gray-500">{pricing.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">¥{pricing.price}</div>
                        <div className="text-xs text-gray-500">{pricing.multiplier}x 基础价</div>
                      </div>
                    </div>
                    {selectedTier === pricing.tier && (
                      <ul className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                        {pricing.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="p-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">合计</span>
                  <span className="text-3xl font-bold text-gray-900">¥{selectedPricing?.price}</span>
                </div>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full btn-accent py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      处理中...
                    </span>
                  ) : (
                    isAuthenticated ? '立即购买' : '登录后购买'
                  )}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  购买后将获得专属授权编号和授权证明书PDF
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PackDetailPage
