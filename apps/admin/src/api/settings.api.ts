import { getAdminHeaders, API_BASE_URL } from '@/lib/auth';

export interface CommunicationSettings {
  id: number;
  // WhatsApp
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappLabelAr: string;
  whatsappLabelEn: string;
  whatsappPosition: 'left' | 'right';
  whatsappEnabled: boolean;
  // Email
  emailEnabled: boolean;
  notificationEmail: string;
  // Telegram
  telegramEnabled: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  // Dashboard
  adminDashboardEnabled: boolean;
}

export async function getCommunicationSettings(): Promise<CommunicationSettings> {
  const response = await fetch(`${API_BASE_URL}/admin/communication-settings`, {
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to load settings');
  }

  return response.json();
}

export async function updateCommunicationSettings(payload: Partial<CommunicationSettings>): Promise<CommunicationSettings> {
  const response = await fetch(`${API_BASE_URL}/admin/communication-settings`, {
    method: 'PUT',
    headers: {
      ...getAdminHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Failed to update settings');
  }

  return response.json();
}

export async function testTelegramConnection(): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/admin/test-telegram`, {
    method: 'POST',
    headers: getAdminHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || 'Telegram test failed');
  }

  return response.json();
}
