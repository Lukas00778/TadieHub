'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, ArrowLeft, CheckCircle, Clock, XCircle } from 'lucide-react'

export default function ChatPage() {
  const params = useParams()
  const supabase = createClient()
  const [booking, setBooking] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*, jobs(*), client:users!client_id(*), provider:users!provider_id(*)')
        .eq('id', params.bookingId)
        .single()

      if (bookingData) {
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*, sender:users!sender_id(*)')
          .eq('booking_id', params.bookingId)
          .order('created_at', { ascending: true })

        setMessages(messagesData || [])
      }

      setBooking(bookingData)
      setLoading(false)
    }

    fetchData()

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${params.bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${params.bookingId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.bookingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSending(false)
      return
    }

    await supabase.from('messages').insert({
      booking_id: params.bookingId,
      sender_id: user.id,
      content: newMessage,
      message_type: 'text',
    })

    setNewMessage('')
    setSending(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', params.bookingId)

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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{otherParty?.full_name}</h1>
          <p className="text-gray-500">{booking.jobs?.title}</p>
        </div>
        <Badge className={
          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
          booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
          'bg-gray-100 text-gray-800'
        }>
          {booking.status}
        </Badge>
      </div>

      {/* Status Actions */}
      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Job Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {booking.status === 'confirmed' && isClient && (
              <Button size="sm" onClick={() => handleStatusChange('in_progress')}>
                <Clock className="w-4 h-4 mr-1" />
                Mark In Progress
              </Button>
            )}
            {booking.status === 'in_progress' && isClient && (
              <Button size="sm" onClick={() => handleStatusChange('completed')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Completed
              </Button>
            )}
            {booking.status !== 'completed' && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange('cancelled')}>
                <XCircle className="w-4 h-4 mr-1" />
                Cancel Job
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-emerald-200' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={sending || booking.status === 'completed' || booking.status === 'cancelled'}
            />
            <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}