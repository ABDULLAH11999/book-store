import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";
import { BRAND_NAME, BRAND_NO_REPLY_EMAIL } from "@/lib/branding";
import { getSiteUrl } from "@/lib/seo";
import { getBundlePricing } from "@/lib/bundle-pricing";

type EmailStatus = "SENT" | "FAILED";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  template: string;
};

type OrderEmailBusiness = {
  phone: string;
  email: string;
  address: string;
};

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderConfirmationInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: OrderEmailItem[];
  subtotal: number;
  total: number;
  business: OrderEmailBusiness;
};

type ResolvedMailConfig = {
  fromName: string;
  fromEmail: string;
  from: string;
  adminEmail: string;
};

type AdminOrderAlertInput = OrderConfirmationInput & {
  customerEmail?: string | null;
  notes?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}

function formatPhoneDisplay(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("92")) return `+${digits}`;
  return `+${digits}`;
}

function getFromEmail() {
  return process.env.RESEND_FROM || `${BRAND_NAME} <${BRAND_NO_REPLY_EMAIL}>`;
}

function getFallbackFromEmail() {
  return process.env.RESEND_FROM_FALLBACK || `${BRAND_NAME} <onboarding@resend.dev>`;
}

function getAdminEmail() {
  return process.env.Admin_Mail || process.env.ADMIN_MAIL || process.env.ADMIN_EMAIL || "";
}

function parseFromAddress(value: string) {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    return {
      fromName: match[1].replace(/^"|"$/g, "").trim() || BRAND_NAME,
      fromEmail: match[2].trim()
    };
  }
  return {
    fromName: BRAND_NAME,
    fromEmail: value.trim()
  };
}

export async function resolveMailConfig(): Promise<ResolvedMailConfig> {
  const [emailSettingsRow, adminMailFromEnv] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { key: "emailSettings" } }),
    Promise.resolve(getAdminEmail())
  ]);

  const settings = emailSettingsRow ? safeJsonParse<Record<string, string>>(emailSettingsRow.value, {}) : {};
  const fallbackFrom = parseFromAddress(getFromEmail());

  const fromName = settings.fromName || fallbackFrom.fromName;
  const fromEmail = settings.fromEmail || fallbackFrom.fromEmail || getFallbackFromEmail();
  const adminEmail = settings.adminMail || adminMailFromEnv;

  return {
    fromName,
    fromEmail,
    from: `${fromName} <${fromEmail}>`,
    adminEmail
  };
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY || "";
}

async function logEmail(params: Pick<EmailPayload, "to" | "subject" | "template">, status: EmailStatus) {
  await prisma.emailLog.create({
    data: {
      toEmail: params.to,
      subject: params.subject,
      template: params.template,
      status,
      sentAt: new Date()
    }
  });
}

function shell(title: string, body: string) {
  const siteUrl = getSiteUrl();
  const logoUrl = `${siteUrl}/ui-image/Logo.avif`;
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#f4f1ea;color:#111;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(title)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f1ea;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border:1px solid #d9d4c7;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(17,17,17,.06);">
              <tr>
                <td style="padding:24px 32px 0;">
                  <img src="${logoUrl}" alt="${BRAND_NAME}" width="96" height="96" style="display:block;width:96px;height:96px;object-fit:contain;" />
                </td>
              </tr>
              ${body}
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function itemRows(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:16px 0;border-bottom:1px solid #ece7de;">
            <div style="font-weight:700;color:#111;line-height:1.5;">${escapeHtml(item.name)}</div>
            <div style="font-size:12px;color:#7a7268;margin-top:5px;letter-spacing:.04em;">Qty: ${item.quantity}</div>
          </td>
          <td align="right" style="padding:16px 0;border-bottom:1px solid #ece7de;font-weight:700;color:#111;">${formatCurrency(
            getBundlePricing(item.quantity, item.price).discountedTotal
          )}</td>
        </tr>`
    )
    .join("");
}

function summaryRow(label: string, value: string, emphasize = false) {
  return `
    <tr>
      <td style="padding-top:8px;font-size:${emphasize ? "18px" : "14px"};font-weight:${emphasize ? "900" : "700"};color:#111;">${escapeHtml(label)}</td>
      <td align="right" style="padding-top:8px;font-size:${emphasize ? "18px" : "14px"};font-weight:${emphasize ? "900" : "700"};color:#111;">${escapeHtml(value)}</td>
    </tr>
  `;
}

export async function sendMail(params: EmailPayload) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    await logEmail(params, "FAILED");
    throw new Error("Resend API key is not configured");
  }

  const mailConfig = await resolveMailConfig();

  const sendOnce = async (from: string) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html
      })
    });

    const raw = await response.text();
    return { response, raw };
  };

  const primary = await sendOnce(mailConfig.from || getFromEmail());
  let finalResult = primary;

  if (!primary.response.ok) {
    const shouldRetry =
      primary.response.status === 403 &&
      /not verified|verify your domain|validation_error/i.test(primary.raw);

    if (shouldRetry) {
      finalResult = await sendOnce(getFallbackFromEmail());
    }
  }

  if (!finalResult.response.ok) {
    await logEmail(params, "FAILED");
    throw new Error(`Resend failed: ${finalResult.response.status} ${finalResult.raw}`);
  }

  await logEmail(params, "SENT");
  return finalResult.raw ? JSON.parse(finalResult.raw) : { ok: true };
}

export function buildOrderConfirmationEmail(input: OrderConfirmationInput) {
  const rows = itemRows(input.items);

  return {
    subject: `Order Confirmation ${input.orderNumber} | ${BRAND_NAME}`,
    html: shell(
      `Order Confirmation ${input.orderNumber}`,
      `
        <tr>
          <td style="background:linear-gradient(135deg,#111 0%,#26211b 100%);color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">${BRAND_NAME}</div>
            <div style="font-size:30px;line-height:1.15;font-weight:800;margin-top:10px;">Your order is confirmed</div>
            <div style="margin-top:12px;color:#e7e0d6;line-height:1.7;font-size:15px;">
              Order <strong>${escapeHtml(input.orderNumber)}</strong> has been received and is now in our processing queue.
            </div>
            <div style="margin-top:22px;display:inline-block;background:#d4a843;color:#111;padding:10px 16px;border-radius:999px;font-weight:700;font-size:13px;">
              Cash on Delivery
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="background:#faf8f3;border:1px solid #ece7de;border-radius:18px;padding:20px;">
                  <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#7a7268;">Customer</div>
                  <div style="font-size:22px;font-weight:800;margin-top:8px;">${escapeHtml(input.customerName)}</div>
                  <div style="color:#5b5348;margin-top:10px;line-height:1.8;font-size:14px;">
                    ${escapeHtml(formatPhoneDisplay(input.phone))}<br/>
                    ${escapeHtml(input.address)}<br/>
                    ${escapeHtml(input.city)}
                  </div>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
              <tr>
                <td style="font-size:14px;font-weight:800;padding-bottom:10px;letter-spacing:.12em;text-transform:uppercase;color:#7a7268;">Order Summary</td>
              </tr>
              ${rows}
              ${summaryRow("Subtotal", formatCurrency(input.subtotal))}
              ${summaryRow("Total", formatCurrency(input.total), true)}
            </table>
            <div style="margin-top:26px;padding:18px;border-left:4px solid #d4a843;background:#fff9ec;border-radius:14px;color:#4c3b10;line-height:1.75;">
              Thank you for shopping with IslamicPlay. Our team will contact you before dispatch if needed.
            </div>
            <div style="margin-top:26px;font-size:13px;color:#666;line-height:1.9;">
              Contact: ${escapeHtml(input.business.phone)}<br/>
              Email: ${escapeHtml(input.business.email)}<br/>
              Address: ${escapeHtml(input.business.address)}
            </div>
            <div style="margin-top:22px;">
              <a href="${getSiteUrl()}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;font-size:13px;">Visit Store</a>
            </div>
          </td>
        </tr>
      `
    )
  };
}

export function buildAdminOrderAlertEmail(input: AdminOrderAlertInput) {
  const rows = itemRows(input.items);

  return {
    subject: `New Order Received ${input.orderNumber} | ${BRAND_NAME}`,
    html: shell(
      `New Order Received ${input.orderNumber}`,
      `
        <tr>
          <td style="background:linear-gradient(135deg,#111 0%,#26211b 100%);color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">Admin Alert</div>
            <div style="font-size:30px;line-height:1.15;font-weight:800;margin-top:10px;">New order placed</div>
            <div style="margin-top:12px;color:#e7e0d6;line-height:1.7;font-size:15px;">Order <strong>${escapeHtml(input.orderNumber)}</strong> is ready for review.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
              <div style="border:1px solid #ece7de;border-radius:18px;padding:18px;background:#faf8f3;">
                <div style="font-size:12px;color:#7a7268;text-transform:uppercase;letter-spacing:.16em;">Customer</div>
                <div style="font-size:18px;font-weight:800;margin-top:8px;">${escapeHtml(input.customerName)}</div>
                <div style="color:#5b5348;margin-top:8px;line-height:1.7;font-size:14px;">${escapeHtml(formatPhoneDisplay(input.phone))}<br/>${escapeHtml(
                  input.customerEmail || "No email provided"
                )}</div>
              </div>
              <div style="border:1px solid #ece7de;border-radius:18px;padding:18px;background:#faf8f3;">
                <div style="font-size:12px;color:#7a7268;text-transform:uppercase;letter-spacing:.16em;">Delivery</div>
                <div style="font-size:18px;font-weight:800;margin-top:8px;">${escapeHtml(input.city)}</div>
                <div style="color:#5b5348;margin-top:8px;line-height:1.7;font-size:14px;">${escapeHtml(input.address)}</div>
              </div>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
              <tr>
                <td style="font-size:14px;font-weight:800;padding-bottom:10px;letter-spacing:.12em;text-transform:uppercase;color:#7a7268;">Items</td>
              </tr>
              ${rows}
              ${summaryRow("Subtotal", formatCurrency(input.subtotal))}
              ${summaryRow("Total", formatCurrency(input.total), true)}
            </table>
            <div style="margin-top:26px;padding:16px 18px;border-left:4px solid #111;background:#f7f7f7;border-radius:14px;color:#333;line-height:1.75;">
              <strong>Notes:</strong> ${escapeHtml(input.notes || "No additional notes provided.")}
            </div>
          </td>
        </tr>
      `
    )
  };
}

export function buildTestEmail(input: { title?: string; message?: string; business?: Partial<OrderEmailBusiness> }) {
  return {
    subject: input.title || `${BRAND_NAME} Test Email`,
    html: shell(
      input.title || `${BRAND_NAME} Test Email`,
      `
        <tr>
          <td style="background:linear-gradient(135deg,#111 0%,#26211b 100%);color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">Email System</div>
            <div style="font-size:30px;line-height:1.15;font-weight:800;margin-top:10px;">Test email delivered</div>
            <div style="margin-top:12px;color:#e7e0d6;line-height:1.7;font-size:15px;">${escapeHtml(
              input.message || `This is a test message from ${BRAND_NAME}.`
            )}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#333;line-height:1.8;">
            <div style="font-weight:700;">Business contact</div>
            <div style="margin-top:8px;color:#555;">
              ${escapeHtml(input.business?.phone || "")}<br/>
              ${escapeHtml(input.business?.email || "")}<br/>
              ${escapeHtml(input.business?.address || "")}
            </div>
          </td>
        </tr>
      `
    )
  };
}

export const orderConfirmationEmail = buildOrderConfirmationEmail;
export const adminOrderAlertEmail = buildAdminOrderAlertEmail;
