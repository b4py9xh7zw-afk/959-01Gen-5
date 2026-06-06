import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ordersAPI, downloadsAPI } from '../services/api'
import { OrderDetail, OrderStatus, tierBadgeColors } from '../types'

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)
  const [refundSuccess, setRefundSuccess] = useState(false)
  const [downloadingPack, setDownloadingPack] = useState(false)
  const [downloadingLicense, setDownloadingLicense] = useState(false)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  const loadOrder = async () => {
    try {
      const res = await ordersAPI.get(parseInt(id!))
      setOrder(res.data.order)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async () => {
    if (!refundReason.trim()) return
    
    setRefunding(true)
    try {
      await ordersAPI.refund(parseInt(id!), refundReason)
      setRefundSuccess(true)
      setShowRefundModal(false)
      loadOrder()
    } catch (error) {
      console.error('Refund failed:', error)
    } finally {
      setRefunding(false)
    }
  }

  const handleDownload = async () => {
    if (order) {
      try {
        setDownloadingPack(true)
        await downloadsAPI.downloadPack(order.licensePurchaseId)
      } catch (error) {
        console.error('Download pack failed:', error)
        alert('下载采样包失败，请重试')
      } finally {
        setDownloadingPack(false)
      }
    }
  }

  const handleDownloadLicense = async () => {
    if (order) {
      try {
        setDownloadingLicense(true)
        await downloadsAPI.downloadLicense(order.licensePurchaseId)
      } catch (error) {
        console.error('Download license failed:', error)
        alert('下载授权证明失败，请重试')
      } finally {
        setDownloadingLicense(false)
      }
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.COMPLETED:
        return <span className="status-badge status-completed">已完成</span>
      case OrderStatus.REFUNDED:
        return <span className="status-badge status-refunded">已退款</span>
      default:
        return <span className="status-badge status-pending">处理中</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">订单不存在</p>
          <Link to="/orders" className="btn-primary">返回订单列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/orders" className="hover:text-primary-600">订单</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900">{order.orderNumber}</span>
        </div>

        {refundSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-green-800">退款成功</h4>
                <p className="text-green-700 text-sm mt-1">
                  退款申请已处理成功。购买记录已保留，但您将无法下载该采样包的未来更新版本。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">订单详情</h1>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-gray-500">订单编号: {order.orderNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">¥{order.amount}</div>
                <div className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start space-x-6 mb-8">
              <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={order.coverImage}
                  alt={order.samplePackName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-1">{order.samplePackName}</h2>
                <p className="text-gray-600 mb-3">by {order.producerName}</p>
                <span className={`status-badge ${tierBadgeColors[order.licenseTier]}`}>
                  {order.licenseTierName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">授权信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">授权编号</span>
                    <span className="font-mono text-accent-600 font-medium">{order.licenseKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">授权类型</span>
                    <span className="text-gray-900">{order.licenseTierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">授权版本</span>
                    <span className="text-gray-900">v{order.currentVersion}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">支付信息</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">支付方式</span>
                    <span className="text-gray-900">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">交易编号</span>
                    <span className="font-mono text-gray-600">{order.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">支付金额</span>
                    <span className="font-semibold text-gray-900">¥{order.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">授权权限说明</h3>
              <p className="text-gray-700 text-sm mb-4">{order.licenseTierDescription}</p>
              <ul className="space-y-2">
                {order.licenseTierFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {order.status === OrderStatus.REFUNDED && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-8">
                <h4 className="font-semibold text-yellow-800 mb-2">退款信息</h4>
                <p className="text-yellow-700 text-sm mb-2">退款原因: {order.refundReason}</p>
                <p className="text-yellow-600 text-sm">
                  退款时间: {new Date(order.refundedAt!).toLocaleDateString('zh-CN')}
                </p>
                <p className="text-yellow-600 text-sm mt-2">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  注意：退款后您仍可下载购买时的原始版本，但无法获取未来的更新版本。
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDownload}
                disabled={(!order.canDownloadUpdates && order.isRefunded) || downloadingPack}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPack ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                    下载中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    下载采样包
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadLicense}
                disabled={downloadingLicense}
                className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingLicense ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500/30 border-t-primary-500 mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    下载授权证明
                  </>
                )}
              </button>
              {order.status === OrderStatus.COMPLETED && !order.isRefunded && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.088 6.412l-1.966-1.966a1 1 0 00-1.414 0l-1.966 1.966a1 1 0 000 1.414l1.966 1.966a1 1 0 001.414 0l1.966-1.966a1 1 0 000-1.414zM15 21H9m6 0a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 002 2m6 0V9" />
                  </svg>
                  申请退款
                </button>
              )}
            </div>
          </div>
        </div>

        <Link to="/orders" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回订单列表
        </Link>
      </div>

      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">申请退款</h3>
            <p className="text-gray-600 mb-6">请填写退款原因，我们将尽快处理您的申请。</p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">退款原因</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="请详细说明退款原因..."
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-700 text-sm">
                <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                退款后，您的购买记录将被保留，但将无法下载该采样包的未来更新版本。您仍可下载购买时的原始版本。
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleRefund}
                disabled={!refundReason.trim() || refunding}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refunding ? '处理中...' : '确认退款'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
