import { Star } from 'lucide-react'
import type { Review } from '@/lib/supabase/client'

interface ReviewCardProps {
  review: Review & {
    reviewer?: {
      full_name: string
      avatar_url?: string
    }
  }
}

export function ReviewCard({ review }: ReviewCardProps) {
  const overallRating =
    (review.rating_quality +
      review.rating_communication +
      review.rating_punctuality +
      review.rating_value) /
    4

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.reviewer?.avatar_url ? (
              <img
                src={review.reviewer.avatar_url}
                alt={review.reviewer.full_name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <span className="text-gray-500 font-medium">
                {review.reviewer?.full_name?.[0] || '?'}
              </span>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {review.reviewer?.full_name || 'Anonymous'}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-900">{overallRating.toFixed(1)}</span>
        </div>
      </div>

      {review.comment && (
        <p className="text-gray-600 text-sm mt-3">{review.comment}</p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
        <div>Quality: {review.rating_quality}/5</div>
        <div>Communication: {review.rating_communication}/5</div>
        <div>Punctuality: {review.rating_punctuality}/5</div>
        <div>Value: {review.rating_value}/5</div>
      </div>
    </div>
  )
}