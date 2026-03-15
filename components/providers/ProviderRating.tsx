import { Star, Award, Shield, CheckCircle } from 'lucide-react'
import type { ProviderRating } from '@/lib/supabase/client'

interface ProviderRatingProps {
  rating?: ProviderRating
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProviderRating({ rating, showDetails = false, size = 'md' }: ProviderRatingProps) {
  if (!rating) {
    return (
      <div className="flex items-center gap-1 text-gray-500">
        <Star className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
        <span className={size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'}>
          New Provider
        </span>
      </div>
    )
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Star className={`${iconSizes[size]} fill-yellow-400 text-yellow-400`} />
          <span className={`font-semibold ${sizeClasses[size]}`}>
            {rating.overall_rating.toFixed(1)}
          </span>
        </div>
        <span className={`text-gray-500 ${sizeClasses[size]}`}>
          ({rating.total_reviews} reviews)
        </span>
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Award className="w-4 h-4 text-green-600" />
            <span>Quality: {rating.quality_avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Star className="w-4 h-4 text-blue-500" />
            <span>Communication: {rating.communication_avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <CheckCircle className="w-4 h-4 text-purple-500" />
            <span>Punctuality: {rating.punctuality_avg.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Shield className="w-4 h-4 text-orange-500" />
            <span>Value: {rating.value_avg.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  )
}