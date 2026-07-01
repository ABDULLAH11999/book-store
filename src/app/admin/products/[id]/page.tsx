import { prisma } from "@/lib/prisma";
import { ProductFormCard } from "@/components/admin/product-form-card";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return null;
    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || "",
      saleEndsAt: product.saleEndsAt?.toISOString().slice(0, 16) || "",
      images: Array.isArray(product.images) ? (product.images as string[]) : [],
      videoUrl: product.videoUrl || "",
      stock: product.stock,
      status: product.status as "DRAFT" | "PUBLISHED" | "OUT_OF_STOCK",
      slug: product.slug
    };
  } catch {
    return null;
  }
}

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  return <ProductFormCard initialProduct={product} />;
}
