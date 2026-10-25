import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../api'
import type { AppNotification } from '../types'

const NOTIFICATIONS_QUERY_KEY = ['notifications']

/**
 * Play a subtle chime sound via Web Audio API (zero asset dependencies)
 */
function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Note 1: High tone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, now) // A5
    gain1.gain.setValueAtTime(0.08, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Note 2: Harmonious resolving tone
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1174.66, now + 0.12) // D6
    gain2.gain.setValueAtTime(0.1, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.5)
  } catch {
    // Audio playback may be restricted by browser policy before user interaction
  }
}

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    enabled: isAuthenticated,
    staleTime: 1000 * 30, // 30s
    refetchOnWindowFocus: true,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    },
  })

  return {
    notifications: query.data?.data ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutate,
    markAllAsRead: markAllReadMutation.mutate,
    isMarkingAllRead: markAllReadMutation.isPending,
    deleteNotification: deleteMutation.mutate,
  }
}

/**
 * Socket listener hook for real-time notifications
 */
export function useNotificationSocket() {
  const { token, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSocket()
      return
    }

    const socket = connectSocket(token)

    const handleNewNotification = (notification: AppNotification) => {
      // 1. Play subtle audio chime
      playNotificationChime()

      // 2. Show toast notification using Sonner
      toast.info(notification.title || 'إشعار جديد', {
        description: notification.message,
        duration: 7000,
        action: notification.link
          ? {
              label: 'عرض',
              onClick: () => {
                if (notification.link) {
                  navigate(notification.link)
                }
              },
            }
          : undefined,
      })

      // 3. Invalidate query cache to refresh notification count & list
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    }

    socket.on('new_notification', handleNewNotification)

    return () => {
      socket.off('new_notification', handleNewNotification)
    }
  }, [isAuthenticated, token, queryClient, navigate])
}
