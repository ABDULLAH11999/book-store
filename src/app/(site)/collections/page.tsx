import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";
import type { Metadata } from "next";
import { getSeoSettings, getSiteUrl } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/branding";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const siteUrl = getSiteUrl(seo);
  const title = `Collections | ${BRAND_NAME}`;
  const description =
    seo.metaDescription ||
    "Browse IslamicPlay collections of Quran, Urdu books, and Islamic gifts in Pakistan.";
  const keywords = [
    "IslamicPlay",
    "Islamic books",
    "Quran",
    "Urdu books",
    "Islamic bookstore Pakistan",
    "buy Quran online",
    "Islamic gifts"
  ];

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords,
    alternates: {
      canonical: `${siteUrl}/collections`
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/collections`,
      siteName: seo.siteTitle || BRAND_NAME,
      type: "website"
    }
  };
}

export default async function CollectionsPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const page = Math.max(1, Number(searchParams?.page || 1));
  const search = String(searchParams?.search || "");
  const type = String(searchParams?.type || "");
  const status = String(searchParams?.status || "");
  const columns = Math.min(4, Math.max(2, Number(searchParams?.columns || 4)));
  const take = 12;

  const filters: Prisma.ProductWhereInput[] = [];

  if (search) {
    filters.push({
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { brand: { contains: search, mode: "insensitive" as const } }
      ]
    });
  }

  if (type) {
    filters.push({
      brand: { contains: type, mode: "insensitive" as const }
    });
  }

  if (status === "sale") {
    filters.push({ salePrice: { not: null } });
  } else if (status === "stock") {
    filters.push({ stock: { gt: 0 } });
  }

  const hasFilters = filters.length > 0;
  const where: Prisma.ProductWhereInput | undefined = hasFilters ? { AND: filters } : undefined;

  let products: Array<any> = [];
  let total = 0;
  try {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * take,
        take
      }),
      prisma.product.count({ where })
    ]);
  } catch {
    products = [];
    total = 0;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.4em] text-gold">Catalog</p>
        <h1 className="mt-2 font-heading text-5xl">Curated IslamicPlay Collection</h1>
      </div>
      <form className="mb-10 rounded-3xl border border-black/10 bg-white p-5">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_0.9fr_0.9fr]">
          <input name="search" placeholder="Search by name" defaultValue={search} className="rounded-2xl border border-black/10 px-4 py-3" />
          <div className="hidden rounded-2xl border border-black/10 px-4 py-3 lg:block">
            <div className="text-xs uppercase tracking-[0.25em] text-black/45">Choose cards per row</div>
            <div className="mt-3 flex items-center gap-2">
              {[
                { value: 2, bars: 2 },
                { value: 3, bars: 3 },
                { value: 4, bars: 4 }
              ].map((item) => (
                <a
                  key={item.value}
                  href={`/collections?${new URLSearchParams({
                    page: "1",
                    search,
                    type,
                    status,
                    columns: String(item.value)
                  }).toString()}`}
                  className={`flex min-w-14 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    columns === item.value ? "border-black bg-black text-white" : "border-black/10 bg-white text-black/70"
                  }`}
                  aria-label={`${item.value} cards per row`}
                >
                  <span className="flex items-end gap-1">
                    {Array.from({ length: item.bars }).map((_, index) => (
                      <span key={index} className={`block h-4 w-1 rounded-full ${columns === item.value ? "bg-white" : "bg-black/50"}`} />
                    ))}
                  </span>
                </a>
              ))}
            </div>
          </div>
          <select name="status" defaultValue={status} className="rounded-2xl border border-black/10 px-4 py-3">
            <option value="">All Status</option>
            <option value="sale">Sale</option>
            <option value="stock">In Stock</option>
          </select>
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="columns" value={String(columns)} />
          <button className="rounded-2xl bg-ink px-4 py-3 font-semibold text-white lg:col-span-1">Apply Filters</button>
        </div>
      </form>
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/15 p-10 text-center text-black/60">
          No products matched your filters. Try a broader search or clear filters.
        </div>
      ) : (
        <div className={`grid grid-cols-2 gap-4 lg:gap-6 ${columns === 2 ? "lg:grid-cols-2" : columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                brand: product.brand,
                price: product.price.toString(),
                salePrice: product.salePrice?.toString() || null,
                images: Array.isArray(product.images) && product.images.length ? (product.images as string[]) : ["/books/asan-tarjuma-quran-1.webp"]
              }}
            />
          ))}
        </div>
      )}
      <div className="mt-10 flex items-center justify-center gap-3">
        {Array.from({ length: Math.ceil(total / take) }).map((_, index) => (
          <a
            key={index}
            href={`/collections?${new URLSearchParams({
              page: String(index + 1),
              search,
              type,
              status,
              columns: String(columns)
            }).toString()}`}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${index + 1 === page ? "bg-gold text-black" : "border border-black/10"}`}
          >
            {index + 1}
          </a>
        ))}
      </div>
    </div>
  );
}
