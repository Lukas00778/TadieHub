'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Calendar, Clock, ArrowLeft, CheckCircle, MessageSquare, Star } from 'lucide-react'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [booking, setBooking] = useState<any>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooking() {
      const { data } = await supabase
        .from('bookings')
        .select('*, jobs(*), client:users!client_id(*), provider:users!provider_id(*)')
        .eq('id', params.id)
        .single()

      setBooking(data)
      setLoading(false)
    }

    fetchBooking()
  }, [params.id])

  const handleStatusChange = async (newStatus: string) => {
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', params.id)

    window.location.reload()
  }

  const handleSubmitReview = async () => {
    setSubmittingReview(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !booking) {
      setSubmittingReview(false)
      return
    }

    const revieweeId = user.id === booking.client_id ? booking.provider_id : booking.client_id

    await supabase.from('reviews').insert({
      booking_id: params.id,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating_quality: reviewForm.rating,
      rating_communication: reviewForm.rating,
      rating_punctuality: reviewForm.rating,
      rating_value: reviewForm.rating,
      comment: reviewForm.comment,
    })

    setSubmittingReview(false)
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (!booking) {
    return <div className="p-8 text-center text-gray-500">Booking not found</div>
  }

  const { data: { user } } = supabase.auth.getUser()
  const isClient = booking.client_id === user?.id
  const otherParty = isClient ? booking.provider : booking.client
  const canReview = booking.status === 'completed' && user?.id !== otherParty?.id

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Bookings
      </Button>

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{booking.jobs?.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                {isClient ? 'Service provider: ' : 'Client: '}
                <span className="font-medium text-gray-900">{otherParty?.full_name}</span>
              </CardDescription>
            </div>
            <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-emerald-600">${booking.agreed_price}</p>
            </div>
            {booking.scheduled_date && (
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{new Date(booking.scheduled_date).toLocaleDateString()}</p>
              </div>
            )}
            {booking.scheduled_time && (
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{booking.scheduled_time}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Job Type</p>
              <p className="font-medium capitalize">{booking.jobs?.category.replace('_', ' ')}</p>
            </div>
          </div>

          {booking.jobs?.location_address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              {booking.jobs.location_address}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {booking.status === 'confirmed' && isClient && (
              <Button onClick={() => handleStatusChange('in_progress')}>
                <Clock className="w-4 h-4 mr-2" />
                Start Job
              </Button>
            )}
            {booking.status === 'in_progress' && isClient && (
              <Button onClick={() => handleStatusChange('completed')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Job
              </Button>
            )}
            <Link href={`/messages/${booking.id}`}>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            </Link>
            {booking.status !== 'completed' && (
              <Button variant="outline" onClick={() => handleStatusChange('cancelled')}>
                Cancel Booking
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Section */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Rate your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      fill="currentColor"
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Comment (optional)</label>
              <textarea
                className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                rows={3}
                placeholder="Share your experience..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>
            <Button onClick={handleSubmitReview} disabled={submittingReview}>
              Submit Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}