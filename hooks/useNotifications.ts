'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/supabase/client'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchNotifications = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching notifications:', error)
      return
    }

    setNotifications(data || [])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to realtime notifications
    const {
      data: { user },
    } = supabase.auth.getUser()

    if (!user) return

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotifications, supabase])

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    )
    return true
  }

  const markAllAsRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      console.error('Error marking all as read:', error)
      return false
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    return true
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}