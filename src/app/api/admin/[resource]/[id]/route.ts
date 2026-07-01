import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { customerSchema, productSchema, testimonialSchema, orderStatusSchema } from "@/lib/validators";
import { toSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { sendOrderWhatsAppNotification } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function formatZodError(error: unknown) {
  if (!(error instanceof ZodError)) return null;
  return error.issues.map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`).join("; ");
}

function refreshStorefront(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path, "page");
  }
}

export async function GET(_: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;

  if (resource === "products") {
    const item = await prisma.product.findUnique({ where: { id } });
    return NextResponse.json({ item });
  }
  if (resource === "customers") {
    const item = await prisma.customer.findUnique({ where: { id }, include: { orders: true } });
    return NextResponse.json({ item });
  }
  if (resource === "testimonials") {
    const item = await prisma.testimonial.findUnique({ where: { id } });
    return NextResponse.json({ item });
  }
  if (resource === "orders") {
    const item = await prisma.order.findUnique({ where: { id }, include: { customer: true } });
    if (!item) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ item });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function PUT(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;
  const body = await request.json();

  if (resource === "products") {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid product" }, { status: 400 });
    const baseSlug = toSlug(parsed.data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.product.findFirst({ where: { slug, id: { not: id } } })) {
      slug = `${baseSlug}-${suffix++}`;
    }
    const item = await prisma.product.update({
      where: { id },
      data: {
        name: parsed.data.name,
        brand: parsed.data.brand,
        description: parsed.data.description,
        price: parsed.data.price,
        salePrice: parsed.data.salePrice ?? null,
        saleEndsAt: parsed.data.saleEndsAt ? new Date(parsed.data.saleEndsAt) : null,
        images: parsed.data.images,
        videoUrl: parsed.data.videoUrl ?? null,
        stock: parsed.data.stock,
        status: parsed.data.status,
        slug,
      }
    });
    refreshStorefront(["/", "/collections", `/product/${existing.slug}`, `/product/${item.slug}`]);
    return NextResponse.json({ item });
  }

  if (resource === "customers") {
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid customer" }, { status: 400 });
    const item = await prisma.customer.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email ?? null,
        address: parsed.data.address,
        city: parsed.data.city
      }
    });
    return NextResponse.json({ item });
  }

  if (resource === "testimonials") {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: formatZodError(parsed.error) || "Invalid testimonial" }, { status: 400 });
    const item = await prisma.testimonial.update({
      where: { id },
      data: {
        customerName: parsed.data.customerName,
        customerImage: parsed.data.customerImage,
        rating: parsed.data.rating,
        reviewText: parsed.data.reviewText,
        status: parsed.data.status,
        sortOrder: parsed.data.sortOrder
      }
    });
    refreshStorefront(["/", "/product/[slug]"]);
    return NextResponse.json({ item });
  }

  if (resource === "orders") {
    const status = orderStatusSchema.safeParse(body.status);
    if (!status.success) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
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

    if ((status.data === "CONFIRMED" || status.data === "CANCELLED") && status.data !== existing.status) {
      const businessSetting = await prisma.siteSettings.findUnique({ where: { key: "businessInfo" } });
      const business = businessSetting ? JSON.parse(businessSetting.value) : {};
      await sendOrderWhatsAppNotification(status.data, {
        orderNumber: item.orderNumber,
        customerName: item.customer.name,
        phone: item.customer.phone,
        items: Array.isArray(item.items) ? (item.items as Array<{ name: string; quantity: number; price: number }>) : [],
        subtotal: Number(item.subtotal),
        total: Number(item.total),
        business
      });
    }
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}

export async function DELETE(_: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { resource, id } = await context.params;

  if (resource === "products") {
    const existing = await prisma.product.findUnique({ where: { id } });
    await prisma.product.delete({ where: { id } });
    if (existing) {
      refreshStorefront(["/", "/collections", `/product/${existing.slug}`]);
    } else {
      refreshStorefront(["/", "/collections"]);
    }
    return NextResponse.json({ ok: true });
  }
  if (resource === "customers") {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  }
  if (resource === "testimonials") {
    if (id.startsWith("demo-testimonial-")) {
      return NextResponse.json({ ok: true });
    }
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ ok: true });
    }
    await prisma.testimonial.delete({ where: { id } });
    refreshStorefront(["/", "/product/[slug]"]);
    return NextResponse.json({ ok: true });
  }
  if (resource === "orders") {
    const deleted = await prisma.order.deleteMany({ where: { id } });
    if (!deleted.count) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ ok: true, deleted: deleted.count });
  }
  return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
}
