import client from './client';

export type ContactSettings = {
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  whatsappLabelAr: string;
  whatsappLabelEn: string;
  whatsappPosition: 'left' | 'right';
  whatsappEnabled: boolean;
};

export async function getContactSettings(): Promise<ContactSettings> {
  const { data } = await client.get<ContactSettings>('/settings');
  return data;
}
