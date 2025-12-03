/**
 * Email service for sending emails via Resend
 * 
 * Note: For production, this should call a backend endpoint or Supabase Edge Function
 * to keep the Resend API key secure. The API key should never be exposed in the frontend.
 */

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient?: string;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send email via Resend API
 * This function should be called from a backend endpoint or Supabase Edge Function
 * in production to keep the API key secure.
 */
export async function sendEmailViaResend(
  params: SendEmailParams
): Promise<EmailSendResult> {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  const fromEmail = params.from || import.meta.env.VITE_RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  if (!apiKey) {
    // If no API key, try to call a backend endpoint instead
    const backendUrl = import.meta.env.VITE_EMAIL_API_URL || '/api/send-email';
    
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to send email' }));
        return {
          success: false,
          error: error.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.id,
        recipient: Array.isArray(params.to) ? params.to.join(', ') : params.to,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      };
    }
  }

  // Direct Resend API call (only for development/testing)
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
      recipient: Array.isArray(params.to) ? params.to.join(', ') : params.to,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

/**
 * Convert plain text to HTML email format
 */
export function formatEmailBody(text: string): string {
  // Convert line breaks to <br> tags
  const html = text
    .replace(/\n/g, '<br>')
    .replace(/\r\n/g, '<br>');
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          ${html}
        </div>
      </body>
    </html>
  `;
}






