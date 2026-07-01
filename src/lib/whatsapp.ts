import { safeJsonParse } from "@/lib/utils";

export type WhatsAppBusinessInfo = {
  whatsappNumber?: string;
  contactPhone?: string;
  metaAccessToken?: string;
  metaPhoneNumberId?: string;
  orderPlacedMessage?: string;
  orderConfirmedMessage?: string;
  orderCancelledMessage?: string;
};

export type WhatsAppOrderItem = {
  name: string;
  quantity: number;
  price: number;
};

export type WhatsAppOrderContext = {
  orderNumber: string;
  customerName: string;
  phone: string;
  items: WhatsAppOrderItem[];
  subtotal: number;
  total: number;
  business: WhatsAppBusinessInfo;
};

export type WhatsAppOrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

function formatCurrency(value: number) {
  return `Rs. ${Number(value).toLocaleString("en-PK")}`;
}

function normalizePhoneNumber(value: string) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

function formatItems(items: WhatsAppOrderItem[]) {
  return items.map((item) => `${item.name} x${item.quantity}`).join(", ");
}

function renderTemplate(template: string, context: Record<string, string>) {
  return template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => context[key] || "");
}

function firstNonEmpty(...values: Array<string | undefined | null>) {
  return values.map((value) => String(value || "").trim()).find((value) => value.length > 0) || "";
}

function buildDefaultTemplate(status: WhatsAppOrderStatus) {
  if (status === "CONFIRMED") {
    return [
      "Assalam o Alaikum {{customerName}},",
      "Your order {{orderNumber}} has been confirmed.",
      "Items: {{items}}",
      "Total: {{total}}",
      "For help, contact us on WhatsApp at {{supportNumber}}."
    ].join("\n");
  }

  if (status === "CANCELLED") {
    return [
      "Assalam o Alaikum {{customerName}},",
      "Your order {{orderNumber}} has been cancelled.",
      "Items: {{items}}",
      "Total: {{total}}",
      "For help, contact us on WhatsApp at {{supportNumber}}."
    ].join("\n");
  }

  return [
    "Assalam o Alaikum {{customerName}},",
    "Your order {{orderNumber}} has been placed successfully.",
    "Items: {{items}}",
    "Subtotal: {{subtotal}}",
    "Total: {{total}}",
    "For help, contact us on WhatsApp at {{supportNumber}}."
  ].join("\n");
}

export function buildWhatsAppOrderMessage(status: WhatsAppOrderStatus, input: WhatsAppOrderContext) {
  const template =
    status === "CONFIRMED"
      ? input.business.orderConfirmedMessage || buildDefaultTemplate(status)
      : status === "CANCELLED"
        ? input.business.orderCancelledMessage || buildDefaultTemplate(status)
        : input.business.orderPlacedMessage || buildDefaultTemplate(status);

  return renderTemplate(template, {
    orderNumber: input.orderNumber,
    customerName: input.customerName,
    phone: input.phone,
    items: formatItems(input.items),
    subtotal: formatCurrency(input.subtotal),
    total: formatCurrency(input.total),
    supportNumber: input.business.whatsappNumber || input.business.contactPhone || "",
    status
  }).trim();
}

export async function sendWhatsAppText(params: {
  to: string;
  message: string;
  accessToken?: string;
  phoneNumberId?: string;
}) {
  const recipient = normalizePhoneNumber(params.to);
  if (!recipient) return { ok: false as const, reason: "missing-recipient" };

  const accessToken = firstNonEmpty(
    params.accessToken,
    process.env.WHATSAPP_ACCESS_TOKEN,
    process.env.META_WHATSAPP_TOKEN,
    process.env.WHATSAPP_TOKEN
  );
  const phoneNumberId = firstNonEmpty(
    params.phoneNumberId,
    process.env.WHATSAPP_PHONE_NUMBER_ID,
    process.env.META_WHATSAPP_PHONE_NUMBER_ID,
    process.env.WHATSAPP_SENDER_PHONE_NUMBER_ID
  );

  if (!accessToken || !phoneNumberId) {
    return { ok: false as const, reason: "missing-config" };
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: params.message
      }
    })
  });

  const raw = await response.text();
  if (!response.ok) {
    return { ok: false as const, reason: raw || response.statusText };
  }

  return { ok: true as const, data: safeJsonParse(raw, { raw }) };
}

export async function sendOrderWhatsAppNotification(status: WhatsAppOrderStatus, input: WhatsAppOrderContext) {
  const message = buildWhatsAppOrderMessage(status, input);
  const accessToken = String(input.business.metaAccessToken || "").trim();
  const phoneNumberId = String(input.business.metaPhoneNumberId || "").trim();

  if (!accessToken || !phoneNumberId) {
    return { ok: false as const, reason: "missing-config" };
  }

  return sendWhatsAppText({
    to: input.phone,
    message,
    accessToken,
    phoneNumberId
  });
}
