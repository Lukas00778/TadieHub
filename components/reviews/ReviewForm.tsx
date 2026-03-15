'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'

interface ReviewFormProps {
  bookingId: string
  revieweeId: string
  onSuccess?: () => void
}

export function ReviewForm({ bookingId, revieweeId, onSuccess }: ReviewFormProps) {
  const [ratingQuality, setRatingQuality] = useState(5)
  const [ratingCommunication, setRatingCommunication] = useState(5)
  const [ratingPunctuality, setRatingPunctuality] = useState(5)
  const [ratingValue, setRatingValue] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to leave a review')
      setIsSubmitting(false)
      return
    }

    const { error: submitError } = await supabase.from('reviews').insert({
      booking_id: bookingId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating_quality: ratingQuality,
      rating_communication: ratingCommunication,
      rating_punctuality: ratingPunctuality,
      rating_value: ratingValue,
      comment: comment || null,
    })

    if (submitError) {
      setError(submitError.message)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    onSuccess?.()
  }

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: number
    onChange: (v: number) => void
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`w-5 h-5 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      <div className="space-y-4">
        <RatingInput
          label="Quality of Work"
          value={ratingQuality}
          onChange={setRatingQuality}
        />
        <RatingInput
          label="Communication"
          value={ratingCommunication}
          onChange={setRatingCommunication}
        />
        <RatingInput
          label="Punctuality"
          value={ratingPunctuality}
          onChange={setRatingPunctuality}
        />
        <RatingInput
          label="Value for Money"
          value={ratingValue}
          onChange={setRatingValue}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Share your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}