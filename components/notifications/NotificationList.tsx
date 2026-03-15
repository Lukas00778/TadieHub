'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationList() {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notifications yet</p>
      </div>
    )
  }

  return (
    <div>
      {unreadCount > 0 && (
        <div className="mb-4">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Mark all as read ({unreadCount} unread)
          </button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border transition-colors cursor-pointer ${
              notification.is_read
                ? 'bg-white border-gray-200'
                : 'bg-blue-50 border-blue-200'
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                  notification.is_read ? 'bg-gray-300' : 'bg-blue-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900">
                  {notification.title}
                </h4>
                {notification.body && (
                  <p className="text-gray-600 text-sm mt-1">
                    {notification.body}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}