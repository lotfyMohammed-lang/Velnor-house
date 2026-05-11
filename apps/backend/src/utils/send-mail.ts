import sgMail from '@sendgrid/mail';

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const sender = process.env.MAIL_SENDER;

  if (!apiKey || !sender) {
    console.warn('⚠️ [sendMail] SENDGRID_API_KEY or MAIL_SENDER not configured. Skipping email.');
    return;
  }

  sgMail.setApiKey(apiKey);

  const msg = {
    to,
    from: sender,
    subject,
    text,
    html: html ?? `<strong>${text}</strong>`,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error: any) {
    console.error('❌ Error sending email');

    if (error.response) {
      console.error(error.response.body);
    } else {
      console.error(error);
    }

    throw new Error('Failed to send email');
  }
}