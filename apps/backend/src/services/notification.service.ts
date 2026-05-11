import { AppDataSource } from '../data-source';
import { Notification } from '../entities/Notification';
import { Setting } from '../entities/Setting';
import { Order } from '../entities/Order';
import { sendMail } from '../utils/send-mail';
import * as https from 'https';

export class NotificationService {
  private static notificationRepository = AppDataSource.getRepository(Notification);
  private static settingsRepository = AppDataSource.getRepository(Setting);

  /**
   * Get or create default settings (aligned with SettingsService ID: 1)
   */
  private static async getSettings() {
    let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

    if (!settings) {
      settings = await this.settingsRepository.findOne({ where: {} });
    }

    if (!settings) {
      console.log('⚠️ [NotificationService] No settings found in DB, creating defaults from ENV...');
      settings = this.settingsRepository.create({
        id: 1,
        whatsappNumber: '201507997888',
        whatsappEnabled: true,
        emailEnabled: true,
        notificationEmail: process.env.MAIL_SENDER,
        telegramEnabled: true,
        telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
        telegramChatId: process.env.TELEGRAM_CHAT_ID,
        adminDashboardEnabled: true,
      });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  private static sanitizeSecret(value?: string | null) {
    if (!value) return undefined;

    let cleaned = value.trim();

    cleaned = cleaned.replace(/^["']|["']$/g, '').trim();

    if (cleaned.toLowerCase().startsWith('bot')) {
      cleaned = cleaned.slice(3).trim();
    }

    return cleaned || undefined;
  }

  private static sanitizePlain(value?: string | null) {
    if (!value) return undefined;
    const cleaned = value.trim().replace(/^["']|["']$/g, '').trim();
    return cleaned || undefined;
  }

  /**
   * Prefer ENV first, then DB fallback
   */
  private static resolveTelegramConfig(settings: Setting) {
    const rawEnvToken = process.env.TELEGRAM_BOT_TOKEN;
    const rawDbToken = settings.telegramBotToken;

    const rawEnvChatId = process.env.TELEGRAM_CHAT_ID;
    const rawDbChatId = settings.telegramChatId;

    const envToken = this.sanitizeSecret(rawEnvToken);
    const dbToken = this.sanitizeSecret(rawDbToken);

    const envChatId = this.sanitizePlain(rawEnvChatId);
    const dbChatId = this.sanitizePlain(rawDbChatId);

    const botToken = envToken || dbToken;
    const chatId = envChatId || dbChatId;

    console.log('🔍 [NotificationService] Telegram resolution:', {
      tokenSource: envToken ? 'ENV' : dbToken ? 'DATABASE' : 'MISSING',
      chatIdSource: envChatId ? 'ENV' : dbChatId ? 'DATABASE' : 'MISSING',
      tokenStart: botToken ? `${botToken.substring(0, 8)}...` : 'MISSING',
      chatId: chatId ?? 'MISSING',
      pathPreview: botToken ? `/bot${botToken.substring(0, 8)}.../sendMessage` : 'MISSING',
    });

    return { botToken, chatId };
  }

  private static getItemTypeLabel(item: any) {
    const productType = item?.productType || item?.type;

    if (productType === 'perfume') {
      if (item?.sizeMl && Number(item.sizeMl) > 0) {
        return `${item.sizeMl}ml`;
      }
      return 'perfume';
    }

    if (productType === 'bag') return 'bag';
    if (productType === 'watch') return 'watch';

    if (item?.sizeMl && Number(item.sizeMl) > 0) {
      return `${item.sizeMl}ml`;
    }

    return 'item';
  }

  private static formatItemTitle(item: any) {
    const brand = item?.brand ? `${item.brand} ` : '';
    const name = item?.name ?? 'Unknown Item';
    return `${brand}${name}`.trim();
  }

  /**
   * Notify about a new order via all enabled channels
   */
  static async notifyNewOrder(order: Order) {
    console.log(`🔔 [NotificationService] Starting notifications for Order #${order.id.slice(0, 8).toUpperCase()}`);

    try {
      const settings = await this.getSettings();
      const { botToken, chatId } = this.resolveTelegramConfig(settings);

      console.log('⚙️ [NotificationService] Configuration:', {
        emailEnabled: settings.emailEnabled,
        telegramEnabled: settings.telegramEnabled,
        adminDashboardEnabled: settings.adminDashboardEnabled,
        notificationEmail: settings.notificationEmail,
        hasTelegramBot: !!botToken,
        hasTelegramChatId: !!chatId,
        telegramChatId: chatId ?? '',
      });

      if (settings.emailEnabled) {
        console.log('📧 [NotificationService] Triggering email branch...');
        this.sendOrderEmail(order, settings)
          .then(() => console.log('✅ [NotificationService] Email process finished.'))
          .catch((err) => console.error('❌ [NotificationService] Email process failed:', err));
      } else {
        console.log('📧 [NotificationService] Email notifications are disabled.');
      }

      if (settings.adminDashboardEnabled) {
        console.log('🖥️ [NotificationService] Creating admin dashboard alert...');
        this.createAdminNotification(order)
          .then(() => console.log('✅ [NotificationService] Admin dashboard alert created.'))
          .catch((err) => console.error('❌ [NotificationService] Admin dashboard alert failed:', err));
      } else {
        console.log('🖥️ [NotificationService] Admin dashboard notifications are disabled.');
      }

      if (settings.telegramEnabled) {
        console.log('🚀 [NotificationService] Triggering Telegram branch...');
        this.sendTelegramNotification(order, settings)
          .then(() => console.log('✅ [NotificationService] Telegram message sent.'))
          .catch((err) => console.error('❌ [NotificationService] Telegram message failed:', err));
      } else {
        console.log('🚀 [NotificationService] Telegram notifications are disabled.');
      }
    } catch (err) {
      console.error('❌ [NotificationService] FATAL ERROR during notification trigger:', err);
    }
  }

  /**
   * Test Telegram notification configuration
   */
  static async testTelegram() {
    const settings = await this.getSettings();
    const { botToken, chatId } = this.resolveTelegramConfig(settings);

    if (!botToken || !chatId) {
      throw new Error('Telegram Bot Token or Chat ID not configured');
    }

    const message = '🚀 *Telegram notification test from Velnor House backend*';

    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          console.log(`📡 [NotificationService] Telegram Test Response [${res.statusCode}]:`, responseBody);

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseBody));
          } else {
            reject(new Error(`Telegram API error: ${res.statusCode} ${responseBody}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ [NotificationService] Telegram Test Network Error:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }

  private static async sendOrderEmail(order: Order, settings: Setting) {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const items = (order.items as any[]) || [];

    const itemsListText = items
      .map((item) => {
        const typeLabel = this.getItemTypeLabel(item);
        return `- ${this.formatItemTitle(item)} (${typeLabel}) x${item.quantity} (EGP ${Number(item.price).toLocaleString()})`;
      })
      .join('\n');

    const itemsListHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${this.formatItemTitle(item)}</strong><br>
          <small style="color: #666;">Type: ${this.getItemTypeLabel(item)} • Quantity: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          EGP ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
        </td>
      </tr>`
      )
      .join('');

    const subject = `VELNOR Order Confirmation - #${order.id.slice(0, 8).toUpperCase()}`;

    const textMessage = `
Hello ${order.fullName},

Thank you for your order! We've received it and are processing it now.

Order Summary:
Order ID: ${order.id}
Date: ${orderDate}

Items:
${itemsListText}

Total Price: EGP ${Number(order.totalPrice).toLocaleString()}

Shipping Address:
${order.address}

Payment Method: ${order.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Cash on Delivery'}

We'll notify you once your order has been dispatched.

Best regards,
The VELNOR Team
    `.trim();

    const htmlMessage = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000; color: #fff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">VELNOR</h1>
          <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Order Confirmation</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin-top: 0;">Hello ${order.fullName},</h2>
          <p style="color: #4b5563; line-height: 1.6;">Thank you for your purchase! Your order has been confirmed and is being prepared for shipment.</p>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Order ID: <strong>#${order.id.toUpperCase()}</strong></p>
            <p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">Date: ${orderDate}</p>
          </div>

          <h3 style="font-size: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 16px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsListHtml}
            <tr>
              <td style="padding: 20px 10px 10px; font-weight: bold; font-size: 18px;">Total</td>
              <td style="padding: 20px 10px 10px; font-weight: bold; font-size: 18px; text-align: right;">EGP ${Number(order.totalPrice).toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 32px; display: grid; grid-template-columns: 1fr 1px 1fr; gap: 20px;">
            <div>
              <h4 style="margin: 0 0 8px; font-size: 14px; color: #9ca3af; text-transform: uppercase;">Shipping Address</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #374151;">${order.address.replace(/\n/g, '<br>')}</p>
            </div>
            <div style="background-color: #f3f4f6;"></div>
            <div>
              <h4 style="margin: 0 0 8px; font-size: 14px; color: #9ca3af; text-transform: uppercase;">Payment Details</h4>
              <p style="margin: 0; font-size: 14px; color: #374151;">Method: ${order.paymentMethod === 'card' ? 'Credit Card' : 'Cash on Delivery'}</p>
            </div>
          </div>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; 2026 VELNOR Fine Perfumery. All rights reserved.</p>
        </div>
      </div>
    `;

    console.log(`📧 [NotificationService] Sending confirmation to customer: ${order.email}`);
    await sendMail(order.email, subject, textMessage, htmlMessage);

    if (settings.notificationEmail && settings.notificationEmail.trim() !== '') {
      console.log(`📧 [NotificationService] Sending alert to admin email: ${settings.notificationEmail}`);
      const adminSubject = `[NEW ORDER] ${order.fullName} - EGP ${Number(order.totalPrice).toLocaleString()}`;
      await sendMail(settings.notificationEmail, adminSubject, textMessage, htmlMessage);
    }
  }

  private static async createAdminNotification(order: Order) {
    const notification = this.notificationRepository.create({
      type: 'new_order',
      title: 'New Order Received',
      message: `New order from ${order.fullName} - EGP ${Number(order.totalPrice).toLocaleString()}`,
      link: `/orders/${order.id}`,
      metadata: {
        orderId: order.id,
        totalPrice: order.totalPrice,
        customerName: order.fullName,
      },
    });

    await this.notificationRepository.save(notification);
  }

  private static async sendTelegramNotification(order: Order, settings: Setting) {
    const { botToken, chatId } = this.resolveTelegramConfig(settings);

    if (!botToken || !chatId) {
      console.warn('⚠️ [NotificationService] Telegram notifications skipped: Bot token or Chat ID missing.');
      return;
    }

    const items = (order.items as any[]) || [];
    const itemsSummary = items
      .map((item) => `• *${item.name}* (${this.getItemTypeLabel(item)}) x${item.quantity}`)
      .join('\n');

    const orderTime = new Date(order.createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const message = `
🛍️ *NEW ORDER ALERT*
───────────────────
🆔 *Order ID:* \`${order.id.slice(0, 8).toUpperCase()}\`
📅 *Date:* ${orderTime}

👤 *CUSTOMER INFO*
───────────────────
• *Name:* ${order.fullName}
• *Phone:* \`${order.phone}\`
• *Email:* ${order.email}

📍 *SHIPPING ADDRESS*
${order.address}

💳 *PAYMENT & TOTAL*
───────────────────
• *Method:* ${order.paymentMethod === 'card' ? '💳 Credit Card' : '💵 Cash on Delivery'}
• *Total Price:* EGP ${Number(order.totalPrice).toLocaleString()}

📦 *ITEMS SUMMARY*
───────────────────
${itemsSummary}
───────────────────
🚀 Processing required in Admin Panel
    `.trim();

    const data = JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    console.log(`🚀 [NotificationService] Sending to Telegram Chat ID: ${chatId}...`);

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = '';

        res.on('data', (chunk) => {
          responseBody += chunk;
        });

        res.on('end', () => {
          console.log(`📡 [NotificationService] Telegram Response [${res.statusCode}]:`, responseBody);

          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(responseBody));
          } else {
            console.error(`❌ [NotificationService] Telegram API error: ${res.statusCode} ${responseBody}`);
            reject(new Error(`Telegram API error: ${res.statusCode} ${responseBody}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ [NotificationService] Telegram Network/Request Error:', error);
        reject(error);
      });

      req.write(data);
      req.end();
    });
  }
}