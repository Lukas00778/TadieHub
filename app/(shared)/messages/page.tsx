'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, ArrowRight } from 'lucide-react'

export default function MessagesPage() {
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
        .in('status', ['confirmed', 'in_progress'])
        .order('updated_at', { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }

    fetchBookings()
  }, [])

  const getOtherParty = (booking: any, currentUserId: string) => {
    return booking.client_id === currentUserId ? booking.provider : booking.client
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-500">Chat with your clients or tradies</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No active conversations</p>
            <p className="text-sm text-gray-400">Start by booking a job</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const otherParty = getOtherParty(booking, '')
            return (
              <Link key={booking.id} href={`/messages/${booking.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">
                            {otherParty?.full_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{otherParty?.full_name}</h3>
                          <p className="text-sm text-gray-500">{booking.jobs?.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={booking.status === 'in_progress' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
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