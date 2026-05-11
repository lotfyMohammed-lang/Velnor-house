import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

export async function getNotifications(): Promise<NotificationsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to load notifications');
  }

  return response.json();
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
    method: 'PUT',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }

  return response.json();
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
    method: 'PUT',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to mark all notifications as read');
  }

  return response.json();
}
