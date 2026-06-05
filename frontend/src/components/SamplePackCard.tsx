import React from 'react'
import { Link } from 'react-router-dom'
import { SamplePack, categoryNames, tierBadgeColors, LicenseTier } from '../types'

interface SamplePackCardProps {
  pack: SamplePack
}

const SamplePackCard: React.FC<SamplePackCardProps> = ({ pack }) => {
  return (
    <Link to={`/pack/${pack.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          <img
            src={pack.coverImage}
            alt={pack.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className={`status-badge ${tierBadgeColors[LicenseTier.PERSONAL]}`}>
              {categoryNames[pack.category]}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="status-badge bg-gray-900/80 text-white">
              v{pack.version}
            </span>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{pack.name}</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">by {pack.producerName}</p>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{pack.sampleCount} 个采样</span>
            <span>{pack.totalDuration}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-gray-900">¥{pack.basePrice}</span>
              <span className="text-sm text-gray-500">起</span>
            </div>
            <div className="text-sm text-primary-600 font-medium flex items-center">
              查看详情
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default SamplePackCard
