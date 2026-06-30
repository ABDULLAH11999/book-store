import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { orderStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const item = await prisma.order.findUnique({ where: { id }, include: { customer: true } });

  if (!item) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = await request.json();
  const status = orderStatusSchema.safeParse(body.status);

  if (!status.success) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id }, include: { customer: true } });

  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const item = await prisma.order.update({
    where: { id },
    data: {
      status: status.data,
      notes: body.notes ?? undefined
    },
    include: { customer: true }
  });

  return NextResponse.json({ item });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const deleted = await prisma.order.deleteMany({ where: { id } });

  if (!deleted.count) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, deleted: deleted.count });
}
