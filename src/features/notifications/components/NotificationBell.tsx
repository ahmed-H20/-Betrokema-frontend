import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../hooks/useNotifications'
import type { AppNotification, NotificationType } from '../types'

interface NotificationBellProps {
  className?: string
  buttonClassName?: string
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'invoice':
      return { icon: 'receipt_long', color: 'text-blue-600 bg-blue-50' }
    case 'payment':
      return { icon: 'payments', color: 'text-emerald-600 bg-emerald-50' }
    case 'stock':
      return { icon: 'inventory_2', color: 'text-amber-600 bg-amber-50' }
    case 'client':
      return { icon: 'person', color: 'text-purple-600 bg-purple-50' }
    default:
      return { icon: 'notifications', color: 'text-slate-600 bg-slate-50' }
  }
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSec < 60) return 'الآن'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `منذ ${diffMin} دقيقة`
    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `منذ ${diffDays} يوم`

    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      day: 'numeric',
      month: 'short',
    }).format(date)
  } catch {
    return ''
  }
}

export function NotificationBell({ className = '', buttonClassName = '' }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
    deleteNotification,
  } = useNotifications()

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      markAsRead(notification._id)
    }
    if (notification.link) {
      setIsOpen(false)
      navigate(notification.link)
    }
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        aria-label="الإشعارات والتنبيهات"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          buttonClassName ||
          'relative rounded-xl p-2.5 text-on-surface-variant transition-all hover:bg-surface-container-high hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer'
        }
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-75">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10 z-50 overflow-hidden text-right flex flex-col max-h-[80vh] animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">الإشعارات</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                  {unreadCount} غير مقروء
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                disabled={isMarkingAllRead}
                onClick={() => markAllAsRead()}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">done_all</span>
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                <span className="text-xs">جاري تحميل الإشعارات...</span>
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 mb-2">
                  <span className="material-symbols-outlined text-[28px]">notifications_none</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">لا توجد إشعارات جديدة</p>
                <p className="text-xs text-slate-400 mt-0.5">ستظهر التنبيهات والأحداث اللحظية هنا فور حدوثها</p>
              </div>
            )}

            {!isLoading &&
              notifications.map((notif) => {
                const { icon, color } = getNotificationIcon(notif.type)
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                      !notif.isRead ? 'bg-orange-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!notif.isRead && (
                      <span className="absolute right-2 top-4 h-2 w-2 rounded-full bg-orange-600 ring-2 ring-white" />
                    )}

                    {/* Icon */}
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4
                          className={`text-xs truncate ${
                            !notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'
                          }`}
                        >
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {/* Delete action */}
                    <button
                      type="button"
                      aria-label="حذف الإشعار"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notif._id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all self-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )
              })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-100 p-2 bg-slate-50/60 text-center">
              <span className="text-[11px] text-slate-400">
                يتم تحديث الإشعارات فورياً عبر الـ WebSocket
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
