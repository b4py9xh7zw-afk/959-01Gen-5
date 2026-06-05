import React, { useState, useEffect } from 'react'
import { downloadsAPI } from '../services/api'
import { DownloadItem, tierBadgeColors } from '../types'

const DownloadsPage: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDownloads()
  }, [])

  const loadDownloads = async () => {
    try {
      const res = await downloadsAPI.list()
      setDownloads(res.data.downloads)
    } catch (error) {
      console.error('Failed to load downloads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPack = (item: DownloadItem) => {
    downloadsAPI.downloadPack(item.id)
  }

  const handleDownloadLicense = (item: DownloadItem) => {
    downloadsAPI.downloadLicense(item.id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">下载中心</h1>
          <p className="text-gray-600">管理您已购买的采样包下载和授权证明</p>
        </div>

        {downloads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无下载</h3>
            <p className="text-gray-500 mb-6">您还没有购买任何采样包</p>
            <a href="/" className="btn-primary inline-block">
              浏览商店
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow hover:shadow-md ${
                  item.isRefunded ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.coverImage}
                          alt={item.samplePackName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{item.samplePackName}</h3>
                        <p className="text-gray-600 text-sm mb-2">by {item.producerName}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`status-badge ${tierBadgeColors[item.licenseTier]}`}>
                            {item.licenseTierName}
                          </span>
                          <span className="status-badge bg-gray-100 text-gray-800">
                            v{item.currentVersion}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-accent-600 font-medium">{item.licenseKey}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        购买于 {new Date(item.purchasedAt).toLocaleDateString('zh-CN')}
                      </div>
                      <div className="text-sm text-gray-900 font-semibold mt-1">
                        ¥{item.pricePaid}
                      </div>
                    </div>
                  </div>

                  {item.isRefunded && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-700 text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {item.downloadNote || '已退款，仅可下载购买时的原始版本'}
                      </p>
                    </div>
                  )}

                  {!item.canDownloadUpdates && !item.isRefunded && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-orange-700 text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {item.downloadNote || '下载更新权限已被限制'}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadPack(item)}
                      disabled={!item.canDownload}
                      className="btn-primary flex items-center text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      下载采样包
                    </button>
                    <button
                      onClick={() => handleDownloadLicense(item)}
                      className="btn-secondary flex items-center text-sm py-2 px-4"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      授权证明
                    </button>
                    <div className="flex items-center text-sm text-gray-500 ml-auto">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {item.canDownloadUpdates ? '可获取更新' : '无更新权限'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl p-8 text-white">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold mb-3">关于授权使用</h3>
            <p className="text-white/90 mb-4">
              请确保您的使用符合所购买的授权类型。每个下载包内都包含详细的授权证明书PDF，
              请妥善保管。如需升级授权类型或有任何疑问，请联系客服。
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-white/80">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                正规授权
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                授权证明
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                永久使用
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DownloadsPage
