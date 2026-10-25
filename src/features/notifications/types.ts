export type NotificationType = 'invoice' | 'stock' | 'client' | 'payment' | 'system'

export interface AppNotification {
  _id: string
  title: string
  message: string
  type: NotificationType
  relatedId?: string | null
  link?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationsApiResponse {
  status: 'success' | 'fail' | 'error'
  data: AppNotification[]
  unreadCount: number
}
