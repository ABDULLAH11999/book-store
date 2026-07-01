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
    ["Order Number", "Customer", "Phone", "Status", "Subtotal", "Total", "Created At"].join(","),
    ...orders.map((order) =>
      [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.status,
        Number(order.subtotal),
        Number(order.total),
        order.createdAt.toISOString()
      ].join(",")
    )
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="orders.csv"'
    }
  });
}
