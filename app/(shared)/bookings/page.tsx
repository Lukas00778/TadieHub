'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, ArrowRight, Clock, User } from 'lucide-react'

export default function BookingsPage() {
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('bookings')
        .select('*, jobs(*), client:users!client_id(*), provider:users!provider_id(*)')
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }

    fetchBookings()
  }, [])

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    disputed: 'bg-orange-100 text-orange-800',
  }

  const { data: { user } } = supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-500">View and manage your jobs</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No bookings yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isClient = booking.client_id === user?.id
            const otherParty = isClient ? booking.provider : booking.client
            return (
              <Link key={booking.id} href={`/bookings/${booking.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{booking.jobs?.title}</h3>
                          <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {isClient ? 'with ' : 'for '} {otherParty?.full_name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            ${booking.agreed_price}
                          </span>
                          {booking.scheduled_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(booking.scheduled_date).toLocaleDateString()}
                            </span>
                          )}
                          {booking.scheduled_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {booking.scheduled_time}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}