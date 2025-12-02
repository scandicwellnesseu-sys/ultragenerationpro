// E-postfunktion med SendGrid-stöd
// Använder mock i utveckling, riktig SendGrid i produktion

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SendGridResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Mock-funktion för utveckling
function mockSendEmail(payload: EmailPayload): SendGridResponse {
  console.log(`[MOCK] Skickar e-post till ${payload.to}: ${payload.subject}`);
  console.log(`[MOCK] ${payload.text}`);
  return { success: true, messageId: `mock-${Date.now()}` };
}

// Riktig SendGrid-implementation
async function sendGridEmail(payload: EmailPayload): Promise<SendGridResponse> {
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.warn('SendGrid API-nyckel saknas, använder mock');
    return mockSendEmail(payload);
  }

  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@yourapp.com';

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: payload.to }] }],
        from: { email: fromEmail },
        subject: payload.subject,
        content: [
          { type: 'text/plain', value: payload.text },
          ...(payload.html ? [{ type: 'text/html', value: payload.html }] : []),
        ],
      }),
    });

    if (response.ok || response.status === 202) {
      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;
      return { success: true, messageId };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.errors?.[0]?.message || `SendGrid error: ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Huvud-exportfunktion
export async function sendEmail(payload: EmailPayload): Promise<SendGridResponse> {
  const useMock = process.env.NODE_ENV === 'development' || 
                  process.env.USE_MOCK_EMAIL === 'true';
  
  if (useMock && !process.env.SENDGRID_API_KEY) {
    return mockSendEmail(payload);
  }
  
  return sendGridEmail(payload);
}

// E-postmallar
export const emailTemplates = {
  lowCredits: (email: string, credits: number): EmailPayload => ({
    to: email,
    subject: 'Lågt kreditsaldo',
    text: `Ditt kreditsaldo är lågt (${credits} krediter kvar). Logga in och köp fler krediter!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Lågt kreditsaldo</h2>
        <p>Hej!</p>
        <p>Ditt kreditsaldo är lågt. Du har <strong>${credits} krediter</strong> kvar.</p>
        <p>Logga in och köp fler krediter för att fortsätta använda AI-prissättning.</p>
        <a href="https://yourapp.com/billing" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Köp krediter
        </a>
      </div>
    `,
  }),
  
  priceApproved: (email: string, productName: string, price: number): EmailPayload => ({
    to: email,
    subject: `Pris godkänt: ${productName}`,
    text: `Priset ${price} kr för ${productName} har godkänts.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">✅ Pris godkänt</h2>
        <p>Priset för <strong>${productName}</strong> har godkänts.</p>
        <p>Nytt pris: <strong>${price} kr</strong></p>
      </div>
    `,
  }),
  
  welcome: (email: string, name: string): EmailPayload => ({
    to: email,
    subject: 'Välkommen till AI-Prissättning!',
    text: `Hej ${name}! Välkommen till AI-Prissättning. Du har fått 10 gratis krediter att börja med.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">🎉 Välkommen!</h2>
        <p>Hej ${name}!</p>
        <p>Välkommen till AI-Prissättning. Du har fått <strong>10 gratis krediter</strong> att börja med.</p>
        <a href="https://yourapp.com/dashboard" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Kom igång
        </a>
      </div>
    `,
  }),
  
  weeklyReport: (email: string, stats: { products: number; savings: number }): EmailPayload => ({
    to: email,
    subject: 'Din veckorapport för AI-Prissättning',
    text: `Den här veckan: ${stats.products} produkter prissatta, uppskattad besparing: ${stats.savings} kr`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">📊 Veckorapport</h2>
        <p>Här är din sammanfattning för den här veckan:</p>
        <ul>
          <li><strong>${stats.products}</strong> produkter prissatta</li>
          <li><strong>${stats.savings} kr</strong> uppskattad besparing</li>
        </ul>
        <a href="https://yourapp.com/analytics" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
          Se full analys
        </a>
      </div>
    `,
  }),
};

// Hjälpfunktion för att skicka mall-e-post
export async function sendTemplateEmail<T extends keyof typeof emailTemplates>(
  template: T,
  ...args: Parameters<typeof emailTemplates[T]>
): Promise<SendGridResponse> {
  const templateFn = emailTemplates[template] as (...args: Parameters<typeof emailTemplates[T]>) => EmailPayload;
  const emailConfig = templateFn(...args);
  return sendEmail(emailConfig);
}
