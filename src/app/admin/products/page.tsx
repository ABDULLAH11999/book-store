import { prisma } from "@/lib/prisma";
import { ProductTable } from "@/components/admin/product-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await (async () => {
    try {
      const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
      return rows.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.toString(),
        salePrice: product.salePrice?.toString() || null,
        images: Array.isArray(product.images) ? (product.images as string[]) : [],
        stock: product.stock,
        status: product.status,
        slug: product.slug
      }));
    } catch {
      return [];
    }
  })();

  return <ProductTable initialProducts={products} />;
}
