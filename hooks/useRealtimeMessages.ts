'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/supabase/client'

export function useRealtimeMessages(bookingId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return
    }

    setMessages(data || [])
    setIsLoading(false)
  }, [bookingId, supabase])

  useEffect(() => {
    fetchMessages()

    // Subscribe to realtime messages for this booking
    const channel = supabase
      .channel(`messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, fetchMessages, supabase])

  const sendMessage = async (content: string, messageType: 'text' | 'photo' | 'location' = 'text') => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        content,
        message_type: messageType,
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return null
    }

    return data
  }

  return { messages, isLoading, sendMessage, refetch: fetchMessages }
}