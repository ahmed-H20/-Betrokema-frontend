import { request } from '@/api/client'
import type { NotificationsApiResponse } from './types'

export async function getNotifications(): Promise<NotificationsApiResponse> {
  return request<NotificationsApiResponse>('/notifications')
}

export async function markNotificationAsRead(id: string): Promise<void> {
  return request<void>(`/notifications/${id}/read`, {
    method: 'PATCH',
  })
}

export async function markAllNotificationsAsRead(): Promise<void> {
  return request<void>('/notifications/mark-all-read', {
    method: 'PATCH',
  })
}

export async function deleteNotification(id: string): Promise<void> {
  return request<void>(`/notifications/${id}`, {
    method: 'DELETE',
  })
}
