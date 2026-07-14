import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

function resolveDurationStart(duration: string | null) {
  const now = new Date();
  if (duration === "24h") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (duration === "7d") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (duration === "30d") return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(value);
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? `="${digits}"` : "";
}

export async function GET(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const duration = searchParams.get("duration");
  const start = resolveDurationStart(duration);

  const orders = await prisma.order.findMany({
    include: { customer: true },
    where: start ? { createdAt: { gte: start } } : undefined,
    orderBy: { createdAt: "desc" }
  });
  const rows = [
    ["Order Number", "Customer", "Phone", "City", "Address", "Status", "Subtotal", "Total", "Created At"].map(csvEscape).join(","),
    ...orders.map((order) =>
      [
        order.orderNumber,
        order.customer.name,
        formatPhone(order.customer.phone),
        order.customer.city || "",
        order.customer.address || "",
        order.status,
        Number(order.subtotal).toFixed(2),
        Number(order.total).toFixed(2),
        formatDateTime(order.createdAt)
      ]
        .map(csvEscape)
        .join(",")
    )
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="orders.csv"'
    }
  });
}
